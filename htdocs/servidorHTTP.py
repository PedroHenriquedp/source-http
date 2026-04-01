import socket
import os
import json

SERVER_HOST = ""
SERVER_PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_file(filename):
    with open(filename, 'rb') as file_handle:
        return file_handle.read()

def write_file(filename,content):
    with open(filename, "wb") as file:
        file.write(content)

def handle_request(request_method, headers, body, client_connection):
    filename = headers[0].split()[1]
    if filename == "/":
        filename = "/login.html"

    if request_method == "GET":
        try:
            address = os.path.join(BASE_DIR, filename.lstrip('/'))
            content = load_file(address)
            responde_command = "HTTP/1.1 200 OK\n\n".encode()
            response = responde_command + content
        except FileNotFoundError as e:
            print(e)
            response = "HTTP/1.1 404 NOT FOUND\n\nERROR 404!File Not Found!".encode()

    if request_method == "POST":
        match filename:
            case "/login.html":
                try:
                    
                    data = json.loads(body.decode())
                    email = data.get("email")
                    senha = data.get("senha")

                    content = load_file("index.html")
                    responde_command = "HTTP/1.1 200 OK\n\n".encode()
                    response = responde_command + content
                except Exception as e:
                    print(e)
                    response = "HTTP/1.1 500 INTERNAL SERVER ERROR\n\nERROR 500!Internal Server Error!".encode()

    client_connection.sendall(response)
    client_connection.close()


server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind((SERVER_HOST, SERVER_PORT))
server_socket.listen(1)

print("Servidor em execução...")
print("Escutando por conexões na porta %s" % SERVER_PORT)

while True:
    client_connection, client_address = server_socket.accept()
    
    request_data = b""

    while b"\r\n\r\n" not in request_data:
        chunk = client_connection.recv(1024)
        
        if chunk == b"": 
            break           
        request_data += chunk

    parts = request_data.split(b"\r\n\r\n", 1)
    text_header = parts[0].decode()
    
    body = b""
    if len(parts) > 1:
        body = parts[1]

    headers_list = text_header.split("\r\n")
    first_line = headers_list[0]
    request_method = first_line.split()[0]

    file_weight = 0
    for line in headers_list:
        if "content-length:" in line.lower():
            file_weight = int(line.split(":")[1].strip())

    while len(body) < file_weight:
        slice = client_connection.recv(1024)
        if slice == b"":
            break
        body += slice

    handle_request(request_method, headers_list, body, client_connection)

server_socket.close()