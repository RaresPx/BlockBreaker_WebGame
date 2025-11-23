from django.urls import path
from . import views

app_name = 'game'  # namespace for templates and reverse URLs

urlpatterns = [
    path('', views.home, name='home'),                 # /game/
    path('play/', views.play_game, name='play'),       # /game/play/
    path('leaderboard/', views.leaderboard, name='leaderboard'),  # /game/leaderboard/
    path('submit_score/', views.submit_score, name='submit_score'),  # /game/submit_score/
]
