import base64

# Specify the path to the font file
font_path = "/home/mahmoud/development/TA_Attendance/scripts/Cairo-Regular.ttf"  # Replace 'fontfile.ttf' with the actual font file name

# Read the font file and encode it in Base64
try:
    with open(font_path, "rb") as font_file:
        base64_data = base64.b64encode(font_file.read()).decode("utf-8")
except FileNotFoundError:
    print(f"Error: The file at {font_path} was not found.")
    base64_data = ""

# Print the Base64 string
print(f"data:font/truetype;base64,{base64_data}")
