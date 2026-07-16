import json
import os

files = {
    'en': 'en.json',
    'hi': 'hi.json',
    'gu': 'gu.json',
    'mr': 'mr.json'
}

data = {}
for lang, file in files.items():
    with open(file, 'r', encoding='utf-8') as f:
        data[lang] = json.load(f)

new_keys = {
    'en': {
        'backToDashboard': 'Back to Dashboard',
        'back': 'Back',
        'enterPhone': 'Enter your Phone Number',
        'usePhoneDesc': 'We use this to find your records.'
    },
    'hi': {
        'backToDashboard': 'डैशबोर्ड पर वापस जाएँ',
        'back': 'वापस',
        'enterPhone': 'अपना फ़ोन नंबर दर्ज करें',
        'usePhoneDesc': 'हम इसका उपयोग आपके रिकॉर्ड खोजने के लिए करते हैं।'
    },
    'gu': {
        'backToDashboard': 'ડેશબોર્ડ પર પાછા ફરો',
        'back': 'પાછા',
        'enterPhone': 'તમારો ફોન નંબર દાખલ કરો',
        'usePhoneDesc': 'અમે તમારા રેકોર્ડ્સ શોધવા માટે આનો ઉપયોગ કરીએ છીએ.'
    },
    'mr': {
        'backToDashboard': 'डॅशबोर्डवर परत जा',
        'back': 'परत',
        'enterPhone': 'तुमचा फोन नंबर प्रविष्ट करा',
        'usePhoneDesc': 'आम्ही तुमचे रेकॉर्ड शोधण्यासाठी याचा वापर करतो.'
    }
}

for lang in files.keys():
    if 'appointment' not in data[lang]:
        data[lang]['appointment'] = {}
    for k, v in new_keys[lang].items():
        data[lang]['appointment'][k] = v

for lang, file in files.items():
    with open(file, 'w', encoding='utf-8') as f:
        json.dump(data[lang], f, ensure_ascii=False, indent=2)

print("Added extra appointment keys successfully!")
