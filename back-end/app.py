# =========================================
# IMPORTS
# =========================================
import re
import sqlite3
import requests
from bs4 import BeautifulSoup

import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# =========================================
# AI CONFIG
# =========================================
genai.configure(api_key="AIzaSyBSdlUL-_Hyee3DUAinZ43r4E6P8Am2rfg")

# =========================================
# FLASK SETUP
# =========================================
app = Flask(__name__)
CORS(app)

DATABASE = "scamshield1.db"

# =========================================
# AI FUNCTION
# =========================================
def ai_analyze(url, page_text):

    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
You are a cybersecurity scam detection AI.

Analyze this website and decide if it is SAFE or SCAM.

URL:
{url}

CONTENT:
{page_text[:2000]}

Return ONLY JSON:
{{
  "status": "Safe | Suspicious | Dangerous",
  "confidence": 0-100,
  "reason": "short explanation"
}}
"""

    response = model.generate_content(prompt)

    return response.text


# =========================================
# DATABASE
# =========================================
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# =========================================
# ANALYZE ROUTE (FIXED)
# =========================================
@app.route("/analyze", methods=["POST"])
def analyze():

    # -------------------------
    # GET DATA FIRST
    # -------------------------
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL required"}), 400

    url_lower = url.lower()

    # -------------------------
    # SCRAPE WEBSITE (SAFE)
    # -------------------------
    page_text = ""

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)

        soup = BeautifulSoup(response.text, "html.parser")
        page_text = soup.get_text().lower()

    except:
        page_text = ""

    # -------------------------
    # RULE-BASED SCORING
    # -------------------------
    risk_score = 0
    reasons = []

    suspicious_keywords = [
        "earn money fast", "crypto", "investment", "free money",
        "urgent", "claim now", "login", "password", "verify"
    ]

    for k in suspicious_keywords:
        if k in url_lower:
            risk_score += 20
            reasons.append(f"Suspicious keyword detected: {k}")

    if not url.startswith("https://"):
        risk_score += 20
        reasons.append("No HTTPS detected")

    # =========================
    # AI ANALYSIS (IMPORTANT PART)
    # =========================
    ai_result = ai_analyze(url, page_text)

    # =========================
    # RETURN RESPONSE
    # =========================
    return jsonify({
        "url": url,
        "risk_score": risk_score,
        "ai_raw": ai_result,
        "reasons": reasons
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True)





