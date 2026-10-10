# Dataset Instructions: UCI Blood Transfusion Service Center

Please place the official dataset files in this directory:
- `transfusion.data`
- `transfusion.names`

### Dataset Source
- **UCI Machine Learning Repository**: [Blood Transfusion Service Center Dataset](https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center)
- **Donor / Creator**: Prof. I-Cheng Yeh, Department of Information Management, Chung-Hua University, Taiwan.

### Attributes in `transfusion.data`:
1. **R (Recency - months since last donation)**: Number of months since the donor's last blood donation.
2. **F (Frequency - total number of donations)**: Total count of donations made by the donor.
3. **M (Monetary - total blood donated in c.c.)**: Total volume of blood donated in cubic centimeters (cc).
4. **T (Time - months since first donation)**: Number of months since the donor's first recorded donation.
5. **Class (whether he/she donated blood in March 2007)**: Binary indicator (1 = Yes / Donated, 0 = No / Did not donate).

> **Note**: Do not commit actual dataset records or modified private data to source control.
