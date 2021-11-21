#My Movies App

The movie entity has:
- id
- title
- year
- photo
- location

Features:

- show the network status (online/offline)
- authenticate users
  - after login, the app stores the auth token in local storage
  - when the app starts, the login page is not opened if the user is authenticated
  - the app allows users to logout
- the resource instances are linked to the authenticated user
  - REST services return only the resources linked to the authenticated user
  - web socket notifications are sent only if the modified resources are linked to the authenticated user
- online/offline behaviour
  - in online mode, the app tries first to use the REST services when new items are created/updated
  - in offline mode or if the REST calls fail, the app stores data locally
  - the user is informed about the items not sent to the server
- when entering the online mode, the app automatically tries to send data to the server
- pagination
- search & filter
- list the movies fetched from the server
- edit or delete a movie
- add a new movie