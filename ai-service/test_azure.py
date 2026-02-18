import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

print("=" * 50)
print("AZURE OPENAI CONNECTION TEST")
print("=" * 50)

endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_API_KEY")
model = os.getenv("AZURE_OPENAI_MODEL")

print(f"Endpoint: {endpoint}")
print(f"API Key set: {bool(api_key)}")
print(f"Model: {model}")

# Remove trailing slash if present
if endpoint and endpoint.endswith('/'):
    endpoint = endpoint[:-1]
    print(f"Cleaned endpoint: {endpoint}")

try:
    client = AzureOpenAI(
        api_key=api_key,
        api_version="2024-02-15-preview",
        azure_endpoint=endpoint
    )
    
    print("\nTesting connection with a simple prompt...")
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say 'Hello, Azure OpenAI is working!'"}],
        max_tokens=20,
        temperature=0.7
    )
    
    print("✅ SUCCESS! Azure OpenAI is working!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\nTroubleshooting tips:")
    print("1. Check if endpoint is correct (should be like: https://your-resource.openai.azure.com)")
    print("2. Verify API key is correct")
    print("3. Ensure model deployment name matches exactly: '" + model + "'")
    print("4. Check if API version '2024-02-15-preview' is supported in your region") 