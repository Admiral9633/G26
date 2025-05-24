from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile
import os
from .models import Feuerwehr, Patient, Kostentraeger, Kontaktperson, Untersuchung
from .serializers import (
    FeuerwehrSerializer,
    PatientSerializer,
    KostentraegerSerializer,
    KontaktpersonSerializer,
    UntersuchungSerializer
)

class FeuerwehrViewSet(viewsets.ModelViewSet):
    queryset = Feuerwehr.objects.all()
    serializer_class = FeuerwehrSerializer

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer

    def get_queryset(self):
        queryset = Patient.objects.all()
        feuerwehr_id = self.request.query_params.get('feuerwehr')
        if feuerwehr_id:
            queryset = queryset.filter(feuerwehr_id=feuerwehr_id)
        return queryset

class UntersuchungViewSet(viewsets.ModelViewSet):
    serializer_class = UntersuchungSerializer

    def get_queryset(self):
        queryset = Untersuchung.objects.all()
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        untersuchung = self.get_object()
        patient = untersuchung.patient
        feuerwehr = patient.feuerwehr

        # Daten für das Template vorbereiten
        context = {
            'untersuchung': untersuchung,
            'patient': patient,
            'feuerwehr': feuerwehr,
        }

        # HTML-Template rendern
        html_string = render_to_string('feuerwehr/untersuchung_pdf.html', context)

        # PDF generieren
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as output_file:
            HTML(string=html_string).write_pdf(output_file)
            output_file.flush()
            output_file.close()

            # PDF-Datei lesen und als Response zurückgeben
            with open(output_file.name, 'rb') as pdf_file:
                response = HttpResponse(pdf_file.read(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="Untersuchung_{patient.nachname}_{patient.vorname}_{untersuchung.untersuchungsdatum}.pdf"'

            # Temporäre Datei löschen
            os.unlink(output_file.name)

        return response

    @action(detail=False, methods=['post'])
    def import_json(self, request):
        try:
            data = request.data
            with transaction.atomic():
                for item in data:
                    patient_data = item.get('patient')
                    untersuchungen_data = item.get('untersuchungen', [])

                    # Prüfen, ob Patient existiert
                    try:
                        patient = Patient.objects.get(
                            nachname=patient_data['nachname'],
                            vorname=patient_data['vorname'],
                            geburtsdatum=patient_data['geburtsdatum'],
                            feuerwehr_id=patient_data['feuerwehr']
                        )
                    except Patient.DoesNotExist:
                        # Patient erstellen, wenn nicht vorhanden
                        patient_serializer = PatientSerializer(data=patient_data)
                        patient_serializer.is_valid(raise_exception=True)
                        patient = patient_serializer.save()

                    # Untersuchungen erstellen
                    for untersuchung_data in untersuchungen_data:
                        untersuchung_data['patient'] = patient.id

                        # Prüfen, ob Untersuchung bereits existiert
                        existing = Untersuchung.objects.filter(
                            patient=patient,
                            untersuchungsdatum=untersuchung_data['untersuchungsdatum']
                        ).first()

                        if not existing:
                            untersuchung_serializer = UntersuchungSerializer(data=untersuchung_data)
                            untersuchung_serializer.is_valid(raise_exception=True)
                            untersuchung_serializer.save()

            return Response({"message": "Daten erfolgreich importiert"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class KostentraegerViewSet(viewsets.ModelViewSet):
    queryset = Kostentraeger.objects.all()
    serializer_class = KostentraegerSerializer

class KontaktpersonViewSet(viewsets.ModelViewSet):
    serializer_class = KontaktpersonSerializer

    def get_queryset(self):
        queryset = Kontaktperson.objects.all()
        kostentraeger_id = self.request.query_params.get('kostentraeger')
        if kostentraeger_id:
            queryset = queryset.filter(kostentraeger_id=kostentraeger_id)
        return queryset

@api_view(['POST'])
def import_patienten(request, feuerwehr_id):
    try:
        feuerwehr = Feuerwehr.objects.get(pk=feuerwehr_id)
    except Feuerwehr.DoesNotExist:
        return Response({'detail': 'Feuerwehr nicht gefunden.'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if not isinstance(data, list):
        # Wenn es kein Array ist, konvertiere es in ein Array
        data = [data]

    imported_patients = []
    errors = []

    with transaction.atomic():
        for item in data:
            patient_data = item.get('patient', {})
            untersuchungen_data = item.get('untersuchungen', [])

            # Stelle sicher, dass die Feuerwehr-ID gesetzt ist
            patient_data['feuerwehr'] = feuerwehr_id

            # Prüfe, ob der Patient bereits existiert
            existing_patients = Patient.objects.filter(
                feuerwehr=feuerwehr,
                nachname=patient_data.get('nachname', ''),
                vorname=patient_data.get('vorname', ''),
                geburtsdatum=patient_data.get('geburtsdatum', None)
            )

            if existing_patients.exists():
                patient = existing_patients.first()
                # Aktualisiere den bestehenden Patienten
                for key, value in patient_data.items():
                    if key != 'feuerwehr':  # Feuerwehr nicht ändern
                        setattr(patient, key, value)
                patient.save()
            else:
                # Erstelle einen neuen Patienten
                patient_serializer = PatientSerializer(data=patient_data)
                if patient_serializer.is_valid():
                    patient = patient_serializer.save()
                else:
                    errors.append(f"Fehler bei Patient {patient_data.get('vorname', '')} {patient_data.get('nachname', '')}: {patient_serializer.errors}")
                    continue

            # Füge Untersuchungen hinzu
            for untersuchung_data in untersuchungen_data:
                untersuchung_data['patient'] = patient.id

                # Prüfe, ob die Untersuchung bereits existiert
                existing = Untersuchung.objects.filter(
                    patient=patient,
                    untersuchungsdatum=untersuchung_data.get('untersuchungsdatum')
                ).first()

                if existing:
                    # Aktualisiere die bestehende Untersuchung
                    for key, value in untersuchung_data.items():
                        if key != 'patient':  # Patient nicht ändern
                            setattr(existing, key, value)
                    existing.save()
                else:
                    # Erstelle eine neue Untersuchung
                    untersuchung_serializer = UntersuchungSerializer(data=untersuchung_data)
                    if untersuchung_serializer.is_valid():
                        untersuchung_serializer.save()
                    else:
                        errors.append(f"Fehler bei Untersuchung für Patient {patient.vorname} {patient.nachname}: {untersuchung_serializer.errors}")

            imported_patients.append(patient_serializer.data if 'patient_serializer' in locals() else {'id': patient.id, 'nachname': patient.nachname, 'vorname': patient.vorname})

    return Response({
        'imported': imported_patients,
        'errors': errors,
        'total_imported': len(imported_patients),
        'total_errors': len(errors)
    })
