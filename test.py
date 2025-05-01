import csv
import random
from faker import Faker

# Initialize Faker
fake = Faker()

# Number of records
num_records = 1000

# Output file
filename = "users_1000.csv"

# Generate fake data
records = []
for _ in range(num_records):
    record = {
        "email": fake.email(),
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "phone": fake.phone_number() if random.random() > 0.2 else "",
        "address": fake.address().replace("\n", ", ") if random.random() > 0.2 else ""
    }
    records.append(record)

# Write to CSV
with open(filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=records[0].keys())
    writer.writeheader()
    writer.writerows(records)

print(f"{filename} created with {num_records} users.")
