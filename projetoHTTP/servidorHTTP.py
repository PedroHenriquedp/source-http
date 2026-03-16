import socket

SERVER_HOST = ""
SERVER_PORT = 8080

def load_file(filename):
    with open(filename, 'rb') as file_handle:
        return file_handle.read()

def write_file(filename,content):
    with open(filename, "w") as file:
        file.write(content)

def read_html(content):
    i=2
    response_content_html = ""
    while content[i] != "/0":
        response_content_html += headers[0].split()[i] + " "
        i += 1
    return response_content_html


def handle_request(request_method, headers):
    filename = headers[0].split()[1]
    if filename == "/":
        filename = "/index.html"

    if request_method == "GET":
        try:
            address = ("./htdocs" + filename)
            content = load_file(address)
            print(content)
            responde_command = "HTTP/1.1 200 OK\n\n".encode()
            response = responde_command + content
        except FileNotFoundError:
            response = "HTTP/1.1 404 NOT FOUND\n\nERROR 404!File Not Found!".encode()

    if request_method == "POST":
        try:
            address = ("./htdocs/" + filename)
            response_content = read_html(headers[0].split())
            print(response_content)
            write_file(address,response_content)
            content = load_file(address)
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
    request = client_connection.recv(1024).decode()

    if request:
        headers = request.split("\n")
        request_method = headers[0].split()[0]

        handle_request(request_method,headers)

server_socket.close()