"""
CLI Entrypoint for running the Blood Bank Management DWDM Data Integration Pipeline
"""
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.pipeline.data_integration import DataIntegrationPipeline

if __name__ == "__main__":
    print("Executing DWDM Data Integration Pipeline...")
    pipeline = DataIntegrationPipeline()
    stats = pipeline.run()
    print("Pipeline executed successfully!")
    print(f"Datasets processed: {list(stats['datasets'].keys())}")
    print(f"Reports generated in: backend/data/reports/integration_report.md")
    print(f"Metadata catalog in: backend/data/integrated/dataset_metadata.json")
