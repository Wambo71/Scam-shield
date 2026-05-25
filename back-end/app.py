# =========================================
# IMPORTS
# =========================================
import re
import sqlite3

from flask import Flask, request, jsonify
from flask_cors import CORS


# =========================================
# APP CONFIG
# =========================================
app = Flask(__name__)
CORS(app)

DATABASE = "scamshield1.db"


# =========================================
# DATABASE SETUP
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
# ANALYZE URL ROUTE
# =========================================
@app.route("/analyze", methods=["POST"])
def analyze():

    # -------------------------
    # GET REQUEST DATA
    # -------------------------
    data = request.get_json()

    if data is None:

        return jsonify({
            "error": "Invalid JSON"
        }), 400

    url = data.get("url", "").strip()

    # -------------------------
    # VALIDATION
    # -------------------------
    if not url:

        return jsonify({
            "error": "URL is required"
        }), 400

    # -------------------------
    # START ANALYSIS
    # -------------------------
    risk_score = 0

    reasons = []

    # =========================================
    # SCAM KEYWORDS
    # =========================================
    suspicious_keywords = [

        "earn money fast",

        "registration fee",

        "crypto",

        "investment",

        "guaranteed income",

        "work from home",

        "double your money",

        "telegram job",

        "quick cash",

        "instant profit"
    ]

    for keyword in suspicious_keywords:

        if keyword in url.lower():

            risk_score += 20

            reasons.append(
                f"Suspicious keyword detected: {keyword}"
            )

    # =========================================
    # HTTPS CHECK
    # =========================================
    if not url.startswith("https://"):

        risk_score += 20

        reasons.append(
            "Website does not use HTTPS"
        )

    # =========================================
    # LONG URL CHECK
    # =========================================
    if len(url) > 60:

        risk_score += 10

        reasons.append(
            "URL is unusually long"
        )

    # =========================================
    # IP ADDRESS CHECK
    # =========================================
    ip_pattern = r"(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}"

    if re.search(ip_pattern, url):

        risk_score += 25

        reasons.append(
            "URL uses IP address instead of domain name"
        )

    # =========================================
    # SUSPICIOUS DOMAINS
    # =========================================
    suspicious_domains = [

        ".xyz",

        ".top",

        ".click",

        ".loan",

        ".gq"
    ]

    for domain in suspicious_domains:

        if domain in url.lower():

            risk_score += 15

            reasons.append(
                f"Suspicious domain detected: {domain}"
            )

    # =========================================
    # TOO MANY HYPHENS
    # =========================================
    hyphen_count = url.count("-")

    if hyphen_count >= 3:

        risk_score += 10

        reasons.append(
            "Too many hyphens in URL"
        )

    # =========================================
    # TOO MANY NUMBERS
    # =========================================
    numbers = re.findall(r"\d", url)

    if len(numbers) >= 6:

        risk_score += 10

        reasons.append(
            "Too many numbers in URL"
        )

    # =========================================
    # SHORTENED URL DETECTION
    # =========================================
    shorteners = [

        "bit.ly",

        "tinyurl",

        "goo.gl",

        "t.co"
    ]

    for shortener in shorteners:

        if shortener in url.lower():

            risk_score += 15

            reasons.append(
                "Shortened URL detected"
            )

    # =========================================
    # LOGIN / PHISHING KEYWORDS
    # =========================================
    login_keywords = [

        "login",

        "verify",

        "bank",

        "account",

        "paypal",

        "password"
    ]

    for word in login_keywords:

        if word in url.lower():

            risk_score += 10

            reasons.append(
                f"Sensitive keyword detected: {word}"
            )

    # =========================================
    # TOO MANY SUBDOMAINS
    # =========================================
    if url.count(".") >= 5:

        risk_score += 15

        reasons.append(
            "Too many subdomains detected"
        )

    # =========================================
    # DETERMINE STATUS
    # =========================================
    if risk_score >= 70:

        status = "Dangerous"

    elif risk_score >= 40:

        status = "Suspicious"

    else:

        status = "Safe"

    # =========================================
    # AI-STYLE ANALYSIS MESSAGE
    # =========================================
    if risk_score >= 70:

        ai_message = (
            "This website shows multiple scam indicators "
            "commonly associated with phishing, fake jobs, "
            "or financial fraud."
        )

    elif risk_score >= 40:

        ai_message = (
            "This website contains suspicious characteristics. "
            "Proceed carefully before sharing personal information."
        )

    else:

        ai_message = (
            "This website appears relatively safe "
            "based on current checks."
        )

    # =========================================
    # RESPONSE
    # =========================================
    return jsonify({

        "url": url,

        "risk_score": risk_score,

        "status": status,

        "reasons": reasons,

        "ai_analysis": ai_message
    })


# =========================================
# REPORT SCAM ROUTE
# =========================================
@app.route("/report", methods=["POST"])
def report_scam():

    data = request.get_json()

    url = data.get("url", "").strip()

    description = data.get(
        "description",
        ""
    ).strip()

    category = data.get(
        "category",
        ""
    ).strip()

    # -------------------------
    # VALIDATION
    # -------------------------
    if not url or not description or not category:

        return jsonify({
            "error": "All fields are required"
        }), 400

    # -------------------------
    # SAVE TO DATABASE
    # -------------------------
    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO reports (
            url,
            description,
            category
        )

        VALUES (?, ?, ?)

    """, (

        url,

        description,

        category
    ))

    conn.commit()

    conn.close()

    return jsonify({

        "message":
        "Scam report submitted successfully"
    })


# =========================================
# GET ALL REPORTS
# =========================================
@app.route("/reports", methods=["GET"])
def get_reports():

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM reports
    """)

    reports = cursor.fetchall()

    conn.close()

    formatted_reports = []

    for report in reports:

        formatted_reports.append({

            "id": report[0],

            "url": report[1],

            "description": report[2],

            "category": report[3]
        })

    return jsonify(formatted_reports)


# =========================================
# DELETE REPORT
# =========================================
@app.route("/report/<int:id>", methods=["DELETE"])
def delete_report(id):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM reports
        WHERE id = ?

    """, (id,))

    conn.commit()

    conn.close()

    return jsonify({

        "message":
        "Report deleted successfully"
    })


# =========================================
# START APPLICATION
# =========================================
init_db()

if __name__ == "__main__":

    app.run(debug=True)