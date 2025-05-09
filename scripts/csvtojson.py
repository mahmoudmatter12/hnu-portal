import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    data = []
    
    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            data.append(row)
    
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    csv_file_path = '/home/mahmoud/development/hnu-portal/Data/ieee.csv'  # Replace with your CSV file path
    json_file_path = '/home/mahmoud/development/hnu-portal/Data/ieee.json'  # Replace with your desired JSON file path
    csv_to_json(csv_file_path, json_file_path)