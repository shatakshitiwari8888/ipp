"""
Helper script: generate_sample_data.py
Creates a realistic sample dataset matching Kaggle's LendingClub format:
`data/accepted_2007_to_2018Q4.csv.gz` and `data/accepted_2007_2018Q4.csv`
with true econometric credit risk relationships.
"""

import os
import gzip
import random
import math

def create_sample_csv(target_csv="data/accepted_2007_2018Q4.csv", target_gz="data/accepted_2007_to_2018Q4.csv.gz", n_rows=6000):
    os.makedirs(os.path.dirname(target_csv), exist_ok=True)
    random.seed(42)
    
    headers = ["id", "member_id", "loan_status", "annual_inc", "dti", "fico_range_low", "loan_amnt"]
    
    print(f"Generating realistic LendingClub dataset with {n_rows} rows...")
    
    rows = []
    for i in range(1, n_rows + 1):
        loan_id = 1000000 + i
        member_id = 5000000 + i
        
        # FICO score: 600 to 830 (mean 695, std 35)
        fico = int(random.gauss(696, 34))
        fico = max(600, min(840, fico))
        
        # Annual income: log-normal around $72,000 with occasional edge cases
        if i % 250 == 0:
            income = 0.0  # edge case annual_inc == 0
        elif i % 150 == 0:
            income = round(random.uniform(320000, 750000), 2)  # outlier
        else:
            income = round(max(15000.0, random.lognormvariate(11.12, 0.45)), 2)
            
        # DTI: Debt-to-income ratio (%)
        if i % 180 == 0:
            dti = ""  # missing value handling
        elif i % 200 == 0:
            dti = round(random.uniform(50.0, 110.0), 2)  # extreme outlier
        else:
            dti = round(max(2.0, random.gauss(18.5, 7.0)), 2)
            
        # Loan amount: $1,000 to $40,000
        loan_amnt = round(random.choice(range(1000, 36000, 500)), 2)
        
        # True underlying credit log-odds of default
        # z = -0.5 - 0.48*z_fico + 0.32*z_dti + 0.28*z_lti - 0.22*z_inc
        safe_inc = max(1000.0, income)
        lti = min(1.5, loan_amnt / safe_inc)
        dti_val = float(dti) if dti != "" else 18.5
        
        z = -0.15 - 0.015 * (fico - 695) + 0.045 * (dti_val - 18.5) + 1.8 * (lti - 0.23) - 0.000005 * (safe_inc - 70000)
        p_default = 1.0 / (1.0 + math.exp(-z))
        
        # Determine status: ~25% unresolved (Current, Grace Period), ~75% resolved
        u = random.random()
        if u < 0.20:
            status = "Current"
        elif u < 0.26:
            status = "In Grace Period"
        else:
            # Resolved contract: outcome driven by credit default probability
            is_default = (random.random() < p_default)
            if is_default:
                status = "Charged Off" if random.random() < 0.70 else "Default"
            else:
                status = "Fully Paid"
                
        rows.append(f"{loan_id},{member_id},{status},{income},{dti},{fico},{loan_amnt}\n")
        
    with open(target_csv, "w", encoding="utf-8") as f:
        f.write(",".join(headers) + "\n")
        f.writelines(rows)
        
    with gzip.open(target_gz, "wt", encoding="utf-8") as f:
        f.write(",".join(headers) + "\n")
        f.writelines(rows)
        
    print(f"Generated {len(rows)} rows -> {target_csv} & {target_gz}")

if __name__ == "__main__":
    create_sample_csv()
