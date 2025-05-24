from django.contrib import admin
from .models import Feuerwehr, Patient, Kostentraeger, Kontaktperson, Untersuchung

@admin.register(Feuerwehr)
class FeuerwehrAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('nachname', 'vorname', 'geburtsdatum', 'feuerwehr')
    list_filter = ('feuerwehr', 'geschlecht')
    search_fields = ('nachname', 'vorname')

class KontaktpersonInline(admin.TabularInline):
    model = Kontaktperson
    extra = 1

@admin.register(Kostentraeger)
class KostentraegerAdmin(admin.ModelAdmin):
    list_display = ('firma', 'ort')
    search_fields = ('firma', 'ort')
    inlines = [KontaktpersonInline]

@admin.register(Kontaktperson)
class KontaktpersonAdmin(admin.ModelAdmin):
    list_display = ('nachname', 'vorname', 'kostentraeger')
    list_filter = ('kostentraeger',)
    search_fields = ('nachname', 'vorname')

@admin.register(Untersuchung)
class UntersuchungAdmin(admin.ModelAdmin):
    list_display = ('patient', 'untersuchungsdatum', 'naechste_untersuchung', 'bewertung')
    list_filter = ('bewertung', 'erstuntersuchung', 'nachuntersuchung')
    search_fields = ('patient__nachname', 'patient__vorname')
    date_hierarchy = 'untersuchungsdatum'