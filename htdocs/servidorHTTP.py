import socket
import os
import json
import mimetypes
import time
import sessao

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

    # --- VALIDAÇÃO DOS COOKIES! Barrar alguém mal intencionado tentando fazer path transversal ---
    session_id = None
    for line in headers:
        if line.lower().startswith("cookie:"):
            parts_cookie = line.split(":", 1)[1].strip().split(";")
            for chunk_cookie in parts_cookie:
                if "session_id=" in chunk_cookie:
                    session_id = chunk_cookie.split("=")[1].strip()
                    break
    public_roots = ["/login.html", "/cadastro.html", "/script_login.js", "/script_cadastro.js", "/style.css"]
    user_logged = sessao.session_validator(session_id)

    # --- VALIDAÇÃO DE ACESSO ATRAVÉS DOS COOKIES! Barrar alguém mal intencionado tentando fazer path transversal ---
    if filename not in public_roots and not user_logged:
        print(f"🔒 Acesso negado para: {filename}. Redirecionando para login...")
        
        response = "HTTP/1.1 302 FOUND\r\nLocation: /login.html\r\n\r\n".encode('utf-8')
        client_connection.sendall(response)
        client_connection.close()
        return

    if request_method == "GET":
        try:
            address = os.path.join(BASE_DIR, filename.lstrip('/'))
            content = load_file(address)
            mime_type, _ = mimetypes.guess_type(address)
            if mime_type is None:
                mime_type = "text/html"
            header = f"HTTP/1.1 200 OK\r\nContent-Type: {mime_type}; charset=utf-8\r\n\r\n"
            response = header.encode() + content
        except FileNotFoundError as e:
            print(e)
            response = "HTTP/1.1 404 NOT FOUND\n\nERROR 404!File Not Found!".encode()

    if request_method == "POST":
        match filename:
            case "/cadastro.html":
                try:
                    data = json.loads(body.decode())
                    email = data.get("email")
                    senha = data.get("senha")
                    
                    users_file = os.path.join(BASE_DIR, 'users.json')
                    
                    try:
                        with open(users_file, 'r', encoding='utf-8') as f:
                            users = json.load(f)
                    except (FileNotFoundError, json.JSONDecodeError):
                        users = {}

                    if email in users:
                        erro_msg = json.dumps({"status": "error", "message": "Este e-mail já está cadastrado."}).encode('utf-8')
                        response = "HTTP/1.1 409 CONFLICT\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode() + erro_msg
                    else:
                        users[email] = senha
                        with open(users_file, 'w', encoding='utf-8') as f:
                            json.dump(users, f, indent=4)
                        
                        sucesso_msg = json.dumps({"status": "success", "message": "Cadastro aprovado"}).encode('utf-8')
                        response = "HTTP/1.1 201 CREATED\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode() + sucesso_msg
                        
                except Exception as e:
                    print(f"Erro no cadastro: {e}")
                    erro_msg = json.dumps({"status": "error", "message": "Erro interno do servidor"}).encode('utf-8')
                    response = "HTTP/1.1 500 INTERNAL SERVER ERROR\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode() + erro_msg
            case "/login.html":
                try:
                    
                    data = json.loads(body.decode())
                    email = data.get("email")
                    senha = data.get("senha")

                    try:
                        with open(os.path.join(BASE_DIR, 'users.json'), 'r') as f:
                            users = json.load(f)
                    except FileNotFoundError:
                        print("Error: User database not found.")
                        erro_msg = json.dumps({"status": "error", "message": "Banco de dados não encontrado"}).encode('utf-8')
                        response = "HTTP/1.1 500 INTERNAL SERVER ERROR\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode() + erro_msg
                        client_connection.sendall(response)
                        client_connection.close()
                        return
                    if email in users and users[email] == senha:
                        new_session_id = sessao.create_session(email)
                        content = json.dumps({"status": "success", "message": "Login aprovado"}).encode('utf-8')
                        responde_command = f"HTTP/1.1 200 OK\r\nSet-Cookie: session_id={new_session_id}; Path=/; HttpOnly\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode()
                    else:
                        content = json.dumps({"status": "error", "message": "Login Inválido"}).encode('utf-8')
                        responde_command = "HTTP/1.1 401 UNAUTHORIZED\r\nContent-Type: application/json; charset=utf-8\r\n\r\n".encode()
                    
                    response = responde_command + content
                except Exception as e:
                    print(e)
                    response = "HTTP/1.1 500 INTERNAL SERVER ERROR\r\n\r\nERROR 500! Internal Server Error!".encode()
            
            case "/index.html":
                try:
                    data = json.loads(body.decode())
                    
                    materia = data.get("materia")
                    data_aula = data.get("data")
                    conteudo = data.get("conteudo") 
                    fotos = data.get("fotos", [])
                    
                    notas_file = os.path.join(BASE_DIR, "notas.json")
                    
                    try:
                        with open(notas_file, 'r', encoding='utf-8') as f:
                            notas = json.load(f)
                    except (FileNotFoundError, json.JSONDecodeError):
                        notas = []
                    
                    nova_nota = {
                        "id": int(time.time() * 1000),
                        "materia": materia,
                        "data": data_aula,
                        "conteudo": conteudo,
                        "fotos": fotos,
                        "timestamp_criacao": time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    
                    notas.insert(0, nova_nota)
                    
                    with open(notas_file, 'w', encoding='utf-8') as f:
                        json.dump(notas, f, ensure_ascii=False, indent=2)
                    
                    responde_command = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n".encode()
                    json_response = json.dumps({"status": "success", "message": "Nota salva", "id": nova_nota["id"]}, ensure_ascii=False)
                    response = responde_command + json_response.encode('utf-8')
                    print(f"Nota salva: {materia} - {data_aula}")
                    
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