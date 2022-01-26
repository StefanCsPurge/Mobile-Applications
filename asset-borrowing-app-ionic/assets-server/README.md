Inchirieri

Pentru a gestiona lucrurile pe care si le imprumuta intre ei (assets - ex carti de joc, joc video),
un grup de prieteni din camin folosesc o aplicatie mobila si un server care ofera servicii REST despre 
aceste lucruri, un asset avand urmatoarele proprietati:
  - id - un intreg pozitiv reprezentand id-ul intern al resursei, ex. 1
  - name - sir de caractere unic, reprezentand numele lucrului, ex 'carti de joc'
  - postBy - sir de caractere reprezentand numele utilizatorului care a postat acest lucru, ex. 'ion'
  - borrowers - o lista de utilizatori care imprumuta (sau vor sa imprumute acest lucru), ex ['ion', 'maria', 'petre']
    Primul din aceasta lista are dreptul sa ia acest lucru, restul fiind in asteptare.
  - status - sir de caractere reprezentand starea oferirii spre inchiriere a acestui lucru, cu valorile
   posibile 'active' si 'inactive'

Aplicatia mobila ofera urmatoarele ecrane separate:

1. (1p) Un ecran ce permite utilizatorului sa-si introduca numele - sir de ceractere. Acest nume este salvat
local, persistent. Pornind de la acest ecran utilizatorul poate deschide ecranele specificate la (2) si (3).

2. Ecranul celui care posteaza lucruri, cu operatii disponibile atat in modul online cat si in modul offline
  a. (1p) Permite inregistrarea unui lucru nou prin introducerea proprietatii name si declansarea 
  unui buton create care face un POST /asset, punand in corpul cererii { name, postBy }.
  b. (1p) Afiseaza toate lucrurile postate de utilizator. Datele sunt aduse de pe server
  via GET /asset?postBy=user.
  c. (1p) Permite modificarea starii unui lucru postat, apeland pe server PATCH /asset/:id si punand 
  in corpul cererii { status }.

3. Ecranul celor care vor sa imprumute lucruri, cu operatii disponibile in modul online
  a. (1p) Permite utilizatorului sa afiseze toate lucrurile disponibile, via GET /asset?status=active.  
  b. (1p) Permite utilizatorului sa imprumute (borrow) sau sa returneze (return) un lucru din lista,
  apeland pe server PATCH /asset/:id cu corpul cererii { borrowers }. Returnarea unui lucru este
  posibila doar daca lucrul a fost imprumutat anterior de utilizator.

(1p) Serverul emite evenimente prin web socket atunci cand starea unui lucru se modifica.
Aplicatia client va afisa o notificare si va actualiza datele prezentate pe ecran.

(1p) In timpul executiei operatiilor de intrare/iesire, locale sau de pe server, aplicatia va afisa
un progress indicator.

(1p) Daca operatiile de intrare/iesire esueaza cu o eroare, utilizatorul va fi notificat si 
i se va permite sa reia (retry) operatia care a esuat. 
