from openai import OpenAI
import os
from dotenv import load_dotenv
from prompts.extraction_prompt import EXTRACTION_PROMPT
from prompts.discharge_prompt import DISCHARGE_RISK_PROMPT

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

def extract_clinical_indicators(clinical_text: str):
    prompt = EXTRACTION_PROMPT.format(clinical_text=clinical_text)
    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

def extract_clinical_indicators_sync(clinical_text: str):
    prompt = EXTRACTION_PROMPT.format(clinical_text=clinical_text)
    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=[{"role": "user", "content": prompt}],
        stream=False
    )
    return response.choices[0].message.content

def assess_discharge_risk(discharge_note: str, visit_history: str):
    prompt = DISCHARGE_RISK_PROMPT.format(
        discharge_note=discharge_note,
        visit_history=visit_history
    )
    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=[{"role": "user", "content": prompt}],
        stream=False
    )
    return response.choices[0].message.content
