from rest_framework import serializers
from .models import Feuerwehr, Patient, Kostentraeger, Kontaktperson, Untersuchung

class FeuerwehrSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feuerwehr
        fields = ['id', 'name', 'kostentraeger', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'feuerwehr', 'nachname', 'vorname', 'geburtsdatum',
            'geschlecht', 'strasse', 'plz', 'ort', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UntersuchungSerializer(serializers.ModelSerializer):
    class Meta:
        model = Untersuchung
        fields = [
            'id', 'patient', 'untersuchungsdatum', 'naechste_untersuchung',
            'erstuntersuchung', 'nachuntersuchung', 'bewertung', 'bemerkungen',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        # Stellen Sie sicher, dass nicht beide Untersuchungstypen gleichzeitig aktiviert sind
        if data.get('erstuntersuchung') and data.get('nachuntersuchung'):
            raise serializers.ValidationError("Es kann nur ein Untersuchungstyp (Erstuntersuchung oder Nachuntersuchung) ausgewählt werden.")

        # Stellen Sie sicher, dass mindestens ein Untersuchungstyp ausgewählt ist
        if not data.get('erstuntersuchung') and not data.get('nachuntersuchung'):
            raise serializers.ValidationError("Es muss ein Untersuchungstyp (Erstuntersuchung oder Nachuntersuchung) ausgewählt werden.")

        return data

class KontaktpersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kontaktperson
        fields = [
            'id', 'kostentraeger', 'nachname', 'vorname', 'position',
            'telefon', 'email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class KostentraegerSerializer(serializers.ModelSerializer):
    kontaktpersonen = KontaktpersonSerializer(many=True, read_only=True)
    standard_kontakt = serializers.PrimaryKeyRelatedField(queryset=Kontaktperson.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Kostentraeger
        fields = [
            'id', 'firma', 'strasse', 'plz', 'ort',
            'standard_kontakt', 'kontaktpersonen', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
