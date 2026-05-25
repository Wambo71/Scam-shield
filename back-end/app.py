from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    """Return a simple status message indicating the backend is running."""
    return "ScamShield Backend Running"


@app.route("/analyze", methods=["POST"])
def analyze():
    """Analyze a URL for potential scam indicators and return a risk assessment."""
    data = request.get_json()

    if data is None:
        return jsonify({
            "error": "Invalid JSON data provided"
        }), 400

    url = data.get("url") or ""

    risk_score = 0

    reasons = []

    suspicious_keywords = [
        "earn money fast",
        "registration fee",
        "crypto",
        "investment",
        "guaranteed income",
        "work from home",
        "double your money",
        "telegram job",
        "quick cash"
    ]

    for keyword in suspicious_keywords:

        if keyword in url.lower():

            risk_score += 20

            reasons.append(
                f"Suspicious keyword detected: {keyword}"
            )

    if not url.lower().startswith("https://"):

        risk_score += 20

        reasons.append(
            "Website does not use HTTPS"
        )

    if len(url) > 50:

        risk_score += 10

        reasons.append(
            "URL is unusually long"
        )

    if risk_score >= 60:

        status = "Dangerous"

    elif risk_score >= 30:

        status = "Suspicious"

    else:

        status = "Safe"

    return jsonify({
        "url": url,
        "risk_score": risk_score,
        "status": status,
        "reasons": reasons
    })


if __name__ == "__main__":
    app.run(debug=True)
