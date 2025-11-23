from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from .models import Score

# Homepage of the game
def home(request):
    return render(request, 'game/home.html')

# Game play page
def play_game(request):
    return render(request, 'game/play.html')

# Leaderboard page
def leaderboard(request):
    # Get top 3 scores, descending order
    top_scores = Score.objects.order_by('-score', 'created_at')[:3]
    return render(request, 'game/leaderboard.html', {'top_scores': top_scores})

# Submit score via AJAX
@csrf_exempt
def submit_score(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)      # parse JSON from JS
            username = data.get("username", "Anonymous")
            score = data.get("score", 0)

            # save to database
            if Score.objects.filter(username = username).exists():
                if score > Score.objects.filter(username = username).first().score:
                    Score.objects.filter(username = username).update(score = score)
            else:
                Score.objects.create(username=username, score=score)

            return JsonResponse({"status": "ok"})  # send response to JS
        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)
    return JsonResponse({"status": "error", "error": "Invalid method"}, status=400)

