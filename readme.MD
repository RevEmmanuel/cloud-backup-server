# Cloud Backup System
This ia a Nodejs (Typescript and Express) server application that serves as a cloud backup system.

### Features
* `Signup`
* `Login`
* `Upload files`
* `Download Files`
* `Folders for easy file arrangement`

### Extras
* `Admin type for content management`
* `Monitoring of file for safety (Admins can mark pictures and videos as unsafe)`
* `Unsafe files automatically get deleted`
* `Revokable Session Management`
* `Multiple admin reviews before file deletion`

### Technologies used:
* `NodeJs (TypeScript & Express)`
* `PostgreSQL`
* `Cloudinary`
* `JWT`
* `Gmail smtp`

### Prerequisites:
* `npm`
* `PostgreSQL Database`
* `Port 5000 open and free`

### Server hosted on:
* [Railway](https://cloud-backup-server-production.up.railway.app/)

[![My Skills](https://skillicons.dev/icons?i=nodejs,typescript,postgresql,postman)](https://skillicons.dev)

# Getting Started
### Clone the Repository
```
git clone https://github.com/RevEmmanuel/cloud-backup-server.git
```

### Configure the database
Create a PostgreSQL database and update the database configuration in the `.env` file.
```properties
DB_USER=
DB_NAME=
DB_PASSWORD=
DB_HOST=
DB_PORT=
JWT_SECRET=
EMAIL_USERNAME=
EMAIL_PASSWORD=
CLOUDINARY_NAME=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
EXTERNAL_URL=
```

### Build and Run the Application
Navigate to the project directory and build the application using npm:
```
npm build
```
Run the application using npm:
```
npm start
```
The application will start running on `http://localhost:5000`.

## Documentation
The API documentation is available through Postman. You can access it using the following link:
* [Postman Documentation](https://bit.ly/cloud-backup-server)

## Developer & Engineer
Adeola Adekunle
* [GitHub (RevEmmanuel)](https://github.com/RevEmmanuel)
* [Twitter (@Adeola_Ade1)](https://twitter.com/Adeola_Ade1)
* [Instagram (@deolaaxo)](https://www.instagram.com/deolaaxo/)
* [LinkedIn (Adeola Adekunle)](https://www.linkedin.com/in/adeola-adekunle-emmanuel/)
* [Email(Adeola Adekunle)](mailto:adeolaae1@gmail.com)

## License
This project is licensed under the [MIT license](https://opensource.org/license/mit/)
