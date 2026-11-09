// =========================================================================================
// GOOGLE APPS SCRIPT - מנגנון שמירה אנונימי ומאובטח ל-GOOGLE SHEETS
// =========================================================================================
// הוראות התקנה (לוקח דקה אחת):
// 1. פתח גיליון Google Sheets חדש בחשבון הגוגל שלך (קרא לו למשל: "תשובות משוב מיתוג אישי").
// 2. בתפריט העליון לחץ על: Extensions (הרחבות) -> Apps Script.
// 3. מחק את כל מה שמופיע שם, והדבק את הקוד הזה.
// 4. לחץ למעלה על כפתור "Deploy" (פריסה) -> "New deployment" (פריסה חדשה).
// 5. בחר בגלגל השיניים סוג: "Web app".
//    - Description: Personal Brand Feedback
//    - Execute as: Me (החשבון שלך)
//    - Who has access: Anyone (כל אחד - כדי שהמשיבים יוכלו לשלוח תשובות ללא צורך בהתחברות לחשבון גוגל)
// 6. לחץ "Deploy", אשר הרשאות בגוגל, והעתק את ה-Web App URL שקיבלת!
// =========================================================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // אם הגיליון ריק, ניצור שורת כותרות
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "תאריך ושעה",
        "הקשר עבודה (Role)",
        "תכונות בולטות",
        "פנו אליי כש... (Go-To)",
        "ייחודיות / מה עושה אחרת",
        "שאלה מותאמת תפקיד",
        "סיפור / רגע זכור",
        "נקודה לשיפור",
        "דימוי / תמונת פרופיל",
        "מזהה מכשיר אנונימי (Hash)"
      ]);
      // עיצוב שורת כותרת
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#EEF2FF");
    }

    var data = JSON.parse(e.postData.contents);

    // מניעת כפילויות אנונימית: בדיקה האם ה-Fingerprint כבר קיים בגיליון
    var fingerprint = data.fingerprint || "none";
    if (fingerprint !== "none") {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][9] === fingerprint) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "duplicate",
            message: "כבר נקלט מענה ממכשיר זה. תודה רבה!"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // הוספת השורה (ללא פרטים מזהים - אנונימיות מוחלטת)
    sheet.appendRow([
      new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
      data.role || "",
      (data.traits || []).join(", "),
      data.goTo || "",
      data.diff || "",
      data.roleSpecific || "",
      data.story || "",
      data.improve || "",
      data.metaphor || "",
      fingerprint
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "המשוב נשמר בהצלחה!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
