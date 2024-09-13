from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.core import Settings

from llama_index.core.postprocessor import MetadataReplacementPostProcessor
from llama_index.core import StorageContext, load_index_from_storage

Settings.llm = Ollama(
    model="mistral",
    request_timeout=30000.0,
    temperature=0,
    system_prompt="you are an assistant and would answer only from the given context. if you don't know the answer, say that you don't know."
)
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en")


storage_context = StorageContext.from_defaults(persist_dir="Acronyms")

sentence_index = load_index_from_storage(storage_context)


chat_engine = sentence_index.as_chat_engine(
    similarity_top_k=2,
    # the target key defaults to `window` to match the node_parser's default
    node_postprocessors=[
        MetadataReplacementPostProcessor(target_metadata_key="window")
    ],
)