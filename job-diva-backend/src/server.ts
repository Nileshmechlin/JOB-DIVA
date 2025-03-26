import app from "./app";
import { AppDataSource } from "./data-source";

const PORT: number = parseInt(process.env.PORT as string) || 5000;

AppDataSource.initialize()
    .then(async () => {
        await AppDataSource.synchronize(); // Force synchronize the database
        console.log(`Database is Successfully Connected !!`);
        
        app.listen(PORT, (err?: any) => {
            if (err) {
                console.log(`Error While Listening : ${PORT}`);
            }
            console.log(`Server is up and Run on PORT : ${PORT}`);
        });
    })
    .catch((error) => console.log(error));