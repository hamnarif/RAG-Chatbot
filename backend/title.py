# from langchain_core.output_parsers import StrOutputParser
# from langchain_core.prompts import ChatPromptTemplate
from langchain_community.llms import Ollama
# from langchain_core.runnables import RunnableLambda, RunnablePassthrough

llm = Ollama(model="mistral")

# template = """You have to Generate a concise generic title (2-3 words, not more than that) that captures the essence of the given question and not answer it.
# Do not answer the question and do not provide any additional note, provide only one best fit title.
# Answer would only consist of the title, no other explanation

# Question: {question}
# """
# prompt = ChatPromptTemplate.from_template(template)
# chain = (
#     {"question": RunnablePassthrough()}
#     | prompt
#     | llm
#     | StrOutputParser()
# )
# res = chain.invoke("ACS stands for?")
# print(res)
# print(type(res))




# from langchain_core.output_parsers import JsonOutputParser
# from langchain_core.pydantic_v1 import BaseModel, Field
# # Define your desired data structure.
# class Joke(BaseModel):
#     setup: str = Field(description="question to set up a joke")
#     punchline: str = Field(description="answer to resolve the joke")

# from langchain.prompts import PromptTemplate
# parser = JsonOutputParser(pydantic_object=Joke)
# prompt = PromptTemplate(
#     template="Answer the user query.\n{format_instructions}\n{query}\n",
#     input_variables=["query"],
#     partial_variables={"format_instructions": parser.get_format_instructions()},
# )
# chain = prompt | llm | parser
# joke_query = "Tell me a joke."

# res = chain.invoke({"query": joke_query})
# print(res)


from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.prompts import PromptTemplate

# Define your data structure for the title.
class Title(BaseModel):
    title: str = Field(description="A concise generic title (2-3 words) capturing the essence of the question")

# Use JsonOutputParser with the Title class.
parser = JsonOutputParser(pydantic_object=Title)

# Define the prompt template for generating the title.
prompt = PromptTemplate(
    template="Generate a concise generic title of strictly (2-3 words) capturing the essence of the given question without giving any additional notes, descriptions, answering the qusetion or clarification.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# Set up the chain for processing the question and generating the title.
chain = prompt | llm | parser

# # Provide the question input.
# question_input = "ACS stands for?"

# # Invoke the chain to generate the title.
# res = chain.invoke({"query": question_input})

# # Print the generated title.
# print(res["title"])
# print(type(res))