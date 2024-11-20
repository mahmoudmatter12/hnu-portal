from supabase import create_client, Client
import os
import json
from dotenv import load_dotenv

# Initialize with your Supabase URL and API key
# Load environment variables from .env file
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)


# Path to your JSON file
json_file_path = '/home/mahmoud/development/TA_Attendance/Data/students.json'

# Open the JSON file and load the data
with open(json_file_path, 'r', encoding='utf-8') as file:
    json_data = json.load(file)

# Insert data into the Students table
response = supabase.table("students").insert(json_data).execute()
