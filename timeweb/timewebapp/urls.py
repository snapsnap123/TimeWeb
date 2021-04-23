from django.urls import path
from . import views
from django.views.generic import TemplateView, RedirectView
from django.http import HttpResponse

urlpatterns = [
    path('', views.TimewebListView.as_view(),name='home'),
    path('settings', views.SettingsView.as_view(),name='settings'),
    path('contact', views.ContactView.as_view(),name='contact'),
    path('changelog', views.ChangelogView.as_view(),name='changelog'),
    path('robots.txt', lambda x: HttpResponse("# If you came from the discord gg you get a super duper secret role\n# pm me 'crawl!' at Arch#5808\n# also, pls don't tell anyone as it'll ruin the fun of this small game\nUser-Agent: *\nDisallow:", content_type="text/plain"), name="robots_file"),
    path('favicon.ico', RedirectView.as_view(url='/static/images/icons/favicon.ico')),
]