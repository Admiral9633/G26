from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    FeuerwehrViewSet,
    PatientViewSet,
    KostentraegerViewSet,
    KontaktpersonViewSet,
    UntersuchungViewSet
)

router = DefaultRouter()
router.register('feuerwehren', FeuerwehrViewSet)
router.register('patienten', PatientViewSet, basename='patient')
router.register('kostentraeger', KostentraegerViewSet)
router.register('kontaktpersonen', KontaktpersonViewSet, basename='kontaktperson')
router.register('untersuchungen', UntersuchungViewSet, basename='untersuchung')

urlpatterns = [
    path('', include(router.urls)),

    # Füge den neuen Endpunkt für den JSON-Import hinzu
    path('feuerwehr/<int:feuerwehr_id>/import-patienten/', views.import_patienten, name='import-patienten'),
]
