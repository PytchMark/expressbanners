#!/usr/bin/env python3

# Debug frontend/backend mapping matching
frontend_content = open('/app/js/app.js').read()
backend_content = open('/app/server.js').read()

backend_services = {
    "Signs": "expressbanners/SignsandBanners",
    "Banners": "expressbanners/SignsandBanners", 
    "Embroidery": "expressbanners/Embroidery",
    "Screen Printing": "expressbanners/Promotional Printing",
    "Graphic Designing": "expressbanners/catalogue"
}

print("Checking frontend mappings:")
for service, folder in backend_services.items():
    pattern = f'{service}: "{folder}"'
    found = pattern in frontend_content
    print(f"  {service}: {folder} -> {pattern} -> {found}")
    if not found:
        # Try alternative patterns
        alt1 = f'"{service}": "{folder}"'
        alt2 = f"'{service}': '{folder}'"
        print(f"    Alt1: {alt1} -> {alt1 in frontend_content}")
        print(f"    Alt2: {alt2} -> {alt2 in frontend_content}")