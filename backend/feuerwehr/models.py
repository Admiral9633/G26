from django.db import models
from django.core.exceptions import ValidationError

class Feuerwehr(models.Model):
    name = models.CharField(max_length=255)
    kostentraeger = models.ForeignKey('Kostentraeger', on_delete=models.SET_NULL, null=True, blank=True, related_name='feuerwehren')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Feuerwehr"
        verbose_name_plural = "Feuerwehren"

class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Männlich'),
        ('W', 'Weiblich'),
        ('D', 'Divers'),
    ]

    feuerwehr = models.ForeignKey(Feuerwehr, on_delete=models.CASCADE, related_name='patienten')
    nachname = models.CharField(max_length=255)
    vorname = models.CharField(max_length=255)
    geburtsdatum = models.DateField()
    geschlecht = models.CharField(max_length=1, choices=GENDER_CHOICES)
    strasse = models.CharField(max_length=255)
    plz = models.CharField(max_length=10)
    ort = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nachname}, {self.vorname}"

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patienten"

class Untersuchung(models.Model):
    BEWERTUNG_CHOICES = [
        ('JA', 'Geeignet'),
        ('NEIN', 'Nicht geeignet'),
        ('BEDINGT', 'Bedingt geeignet'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='untersuchungen')
    untersuchungsdatum = models.DateField()
    naechste_untersuchung = models.DateField(null=True, blank=True)
    erstuntersuchung = models.BooleanField(default=False)
    nachuntersuchung = models.BooleanField(default=False)
    bewertung = models.CharField(max_length=10, choices=BEWERTUNG_CHOICES)
    bemerkungen = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Untersuchung vom {self.untersuchungsdatum} für {self.patient}"

    class Meta:
        verbose_name = "Untersuchung"
        verbose_name_plural = "Untersuchungen"
        unique_together = [['patient', 'untersuchungsdatum']]  # Verhindert doppelte Untersuchungen am selben Tag

class Kostentraeger(models.Model):
    firma = models.CharField(max_length=255)
    strasse = models.CharField(max_length=255)
    plz = models.CharField(max_length=10)
    ort = models.CharField(max_length=255)
    standard_kontakt = models.ForeignKey('Kontaktperson', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.firma

    class Meta:
        verbose_name = "Kostenträger"
        verbose_name_plural = "Kostenträger"

class Kontaktperson(models.Model):
    kostentraeger = models.ForeignKey(Kostentraeger, on_delete=models.CASCADE, related_name='kontaktpersonen')
    nachname = models.CharField(max_length=255)
    vorname = models.CharField(max_length=255)
    position = models.CharField(max_length=255, blank=True)
    telefon = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nachname}, {self.vorname}"

    class Meta:
        verbose_name = "Kontaktperson"
        verbose_name_plural = "Kontaktpersonen"
