export async function analyzeFoodImage(base64Image: string) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });
  return response.json();
}

export async function getMealRecommendations(userProfile: any, context: string) {
  const response = await fetch('/api/ai/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userProfile, context }),
  });
  return response.json();
}

export async function getHabitNudge(history: any[]) {
  const response = await fetch('/api/ai/nudge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history }),
  });
  return response.json();
}
