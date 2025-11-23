from django.db import models

class Score(models.Model):
    username = models.CharField(max_length=50)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.score}"
    