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

# Add gallery items
new_gallery_keys = {
    'en': {
        'reception': 'Reception Area',
        'consultation': 'Consultation Room',
        'waitingArea': 'Waiting Area',
        'medicineStorage': 'Medicine Storage',
        'healthEducation': 'Health Education Corner',
        'clinicEntrance': 'Clinic Entrance',
        'catClinicInterior': 'Clinic Interior',
        'catConsultation': 'Consultation',
        'catWellness': 'Wellness'
    },
    'hi': {
        'reception': 'रिसेप्शन एरिया',
        'consultation': 'परामर्श कक्ष',
        'waitingArea': 'प्रतीक्षा क्षेत्र',
        'medicineStorage': 'दवा भंडारण',
        'healthEducation': 'स्वास्थ्य शिक्षा कोना',
        'clinicEntrance': 'क्लिनिक प्रवेश द्वार',
        'catClinicInterior': 'क्लिनिक इंटीरियर',
        'catConsultation': 'परामर्श',
        'catWellness': 'स्वस्थता'
    },
    'gu': {
        'reception': 'રિસેપ્શન એરિયા',
        'consultation': 'કન્સલ્ટેશન રૂમ',
        'waitingArea': 'વેઇટિંગ એરિયા',
        'medicineStorage': 'મેડિસિન સ્ટોરેજ',
        'healthEducation': 'હેલ્થ એજ્યુકેશન કોર્નર',
        'clinicEntrance': 'ક્લિનિક એન્ટ્રન્સ',
        'catClinicInterior': 'ક્લિનિક ઇન્ટિરિયર',
        'catConsultation': 'કન્સલ્ટેશન',
        'catWellness': 'વેલનેસ'
    },
    'mr': {
        'reception': 'रिसेप्शन एरिया',
        'consultation': 'कन्सल्टेशन रूम',
        'waitingArea': 'वेटिंग एरिया',
        'medicineStorage': 'औषध साठवण',
        'healthEducation': 'आरोग्य शिक्षण कोपरा',
        'clinicEntrance': 'क्लिनिक प्रवेशद्वार',
        'catClinicInterior': 'क्लिनिक इंटिरियर',
        'catConsultation': 'कन्सल्टेशन',
        'catWellness': 'वेलनेस'
    }
}

for lang in files.keys():
    for k, v in new_gallery_keys[lang].items():
        data[lang]['gallery'][k] = v
        
# Add new Home/Service keys
new_misc = {
    'en': {
        'services_seeAll': 'See All Services',
        'about_knowMore': 'Know More',
        'trust_verified': 'Verified',
        'trust_patientCare': 'Patient Care',
        'trust_focus': '100% Focus',
        'location_addressLabel': 'Address',
        'location_phoneLabel': 'Phone',
        'location_emailLabel': 'Email'
    },
    'hi': {
        'services_seeAll': 'सभी सेवाएं देखें',
        'about_knowMore': 'अधिक जानें',
        'trust_verified': 'सत्यापित',
        'trust_patientCare': 'रोगी देखभाल',
        'trust_focus': '100% फोकस',
        'location_addressLabel': 'पता',
        'location_phoneLabel': 'फ़ोन',
        'location_emailLabel': 'ईमेल'
    },
    'gu': {
        'services_seeAll': 'બધી સેવાઓ જુઓ',
        'about_knowMore': 'વધુ જાણો',
        'trust_verified': 'ચકાસાયેલ',
        'trust_patientCare': 'પેશન્ટ કેર',
        'trust_focus': '100% ફોકસ',
        'location_addressLabel': 'સરનામું',
        'location_phoneLabel': 'ફોન',
        'location_emailLabel': 'ઇમેઇલ'
    },
    'mr': {
        'services_seeAll': 'सर्व सेवा पहा',
        'about_knowMore': 'अधिक जाणून घ्या',
        'trust_verified': 'सत्यापित',
        'trust_patientCare': 'रुग्ण सेवा',
        'trust_focus': '100% लक्ष',
        'location_addressLabel': 'पत्ता',
        'location_phoneLabel': 'फोन',
        'location_emailLabel': 'ईमेल'
    }
}

for lang in files.keys():
    data[lang]['services']['seeAll'] = new_misc[lang]['services_seeAll']
    data[lang]['about']['knowMore'] = new_misc[lang]['about_knowMore']
    data[lang]['trust']['verified'] = new_misc[lang]['trust_verified']
    data[lang]['trust']['patientCareLabel'] = new_misc[lang]['trust_patientCare']
    data[lang]['trust']['focus'] = new_misc[lang]['trust_focus']
    data[lang]['location']['addressLabel'] = new_misc[lang]['location_addressLabel']
    data[lang]['location']['phoneLabel'] = new_misc[lang]['location_phoneLabel']
    data[lang]['location']['emailLabel'] = new_misc[lang]['location_emailLabel']

for lang, file in files.items():
    with open(file, 'w', encoding='utf-8') as f:
        json.dump(data[lang], f, ensure_ascii=False, indent=2)
