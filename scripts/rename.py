from googletrans import Translator
import json

def translate_text(text, dest_language):
    translator = Translator()
    translation = translator.translate(text, dest=dest_language)
    return translation.text


def getdata():
    with open('/home/mahmoud/development/hnu-portal/Data/ocs2.json') as f:
        data = json.load(f)
        for i in data:
            if i['name'].isascii():
                continue
            else:
                text_to_translate = i['name']
                destination_language = "en"  
                translated_text = translate_text(text_to_translate, destination_language)
                i['name'] = translated_text
            
    with open('/home/mahmoud/development/hnu-portal/Data/ocs2.json', 'w') as f:
        json.dump(data, f, indent=4)
            

def sort_by_names():
    with open('/home/mahmoud/development/hnu-portal/Data/ocs2.json') as f:
        data = json.load(f)
        data = sorted(data, key=lambda x: x['name'])
        
    with open('/home/mahmoud/development/hnu-portal/Data/ocs2.json', 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    sort_by_names()