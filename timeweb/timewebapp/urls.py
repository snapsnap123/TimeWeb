from django.urls import path, re_path
from . import views
from django.views.generic import RedirectView
from django.http import HttpResponse
from django.conf import settings

urlpatterns = [
    path('', views.TimewebView.as_view(),name='home'),
    path('settings', views.SettingsView.as_view(),name='settings'),
    path('blog', views.BlogView.as_view(),name='blog'),
    path('user-guide', views.UserguideView.as_view(), name='user-guide'),
    path('changelog', views.ChangelogView.as_view(),name='changelog'),
    path('credits', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/credits.html'), name='credits'),
    path('policies', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/policies/policies.html'), name='policies'),
    path('cookies', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/policies/cookies.html')),
    path('disclaimer', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/policies/disclaimer.html')),
    path('privacy', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/policies/privacy.html')),
    path('terms', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/policies/terms.html')),
    path('gc-api-auth-init', views.GCOAuthView.as_view()),
    path('gc-api-auth-callback', views.GCOAuthView.as_view()),

    path('robots.txt', lambda x: HttpResponse("# If you came from the discord gg you get a super duper secret role\n# pm me this message at Arch#5808\n# also, pls don't tell anyone as it'll ruin the fun of this small game\nUser-Agent: *\nDisallow:", content_type="text/plain"), name="robots_file"),
    path('.well-known/security.txt', lambda x: HttpResponse('''Contact: mailto:arhan.ch@gmail.com
Expires: 2023-07-27T07:00:00.000Z
Preferred-Languages: en
Canonical: https://timeweb.io/.well-known/security.txt''', content_type="text/plain"), name="security_file"),
    path('android-chrome-192x192.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/android-chrome-192x192.png')),
    path('android-chrome-512x512.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/android-chrome-512x512.png')),
    path('apple-touch-icon-precomposed.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/apple-touch-icon-precomposed.png')),
    path('apple-touch-icon.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/apple-touch-icon.png')),
    path('browserconfig.xml', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/browserconfig.xml')),
    path('favicon-16x16.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/favicon-16x16.png')),
    path('favicon-32x32.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/favicon-32x32.png')),
    path('favicon.ico', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/favicon.ico')),
    path('mstile-150x150.png', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/mstile-150x150.png')),
    path('safari-pinned-tab.svg', RedirectView.as_view(url='https://storage.googleapis.com/twstatic/images/icons/safari-pinned-tab.svg')),

    path('stackpile', views.StackpileView.as_view(), name='stackpile'),
    path('spooky', views.SpookyView.as_view(), name="spooky"),
    path('sus', views.SusView.as_view(), name="sus"),
    re_path(r"^(wp|wordpress)", views.RickView.as_view()),
]
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns.append(path('media/images/<str:imageUser>/<str:imageName>', views.ImagesView.as_view(), name='images'))