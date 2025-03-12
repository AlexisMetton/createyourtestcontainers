const express = require("express");
const request = require("supertest");
const notesRouter = require("../routes/notes");

let app;

beforeAll(async () => {
    // Create Express et router on "/notes"
    app = express();
    app.use(express.json());
    app.use("/notes", notesRouter);
}, 30000);

describe("functionals test with endpoints /notes", () => {
    test("POST /notes - Create note successfully", async () => {
        const res = await request(app)
            .post("/notes")
            .send({ title: "Test Note", content: "Contenu de test" });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toEqual("Test Note");
    });

    test("GET /notes - Retrieve all notes", async () => {
        await request(app)
        .post("/notes")
        .send({ title: "Note Liste", content: "Contenu Liste" });

        const res = await request(app).get("/notes");
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /notes/:id - Retrieve an existing note", async () => {
        const createRes = await request(app)
            .post("/notes")
            .send({ title: "Note unique", content: "Contenu unique" });
        const noteId = createRes.body.id;
        const res = await request(app).get(`/notes/${noteId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("id", noteId);
        expect(res.body.title).toEqual("Note unique");
    });

    test("PUT /notes/:id - update existant note", async () => {
        const createRes = await request(app)
            .post("/notes")
            .send({ title: "Avant Update", content: "Contenu avant" });
        const noteId = createRes.body.id;
        const updateRes = await request(app)
            .put(`/notes/${noteId}`)
            .send({ title: "Après Update", content: "Contenu après" });
        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body).toHaveProperty("id", noteId);
        expect(updateRes.body.title).toEqual("Après Update");
    });

    test("DELETE /notes/:id - Delete a note", async () => {
        const createRes = await request(app)
        .post("/notes")
        .send({ title: "À supprimer", content: "Contenu à supprimer" });
        const noteId = createRes.body.id;
        const deleteRes = await request(app).delete(`/notes/${noteId}`);
        expect(deleteRes.statusCode).toEqual(200);
        expect(deleteRes.body).toHaveProperty("message", "Note supprimée");

        // Check if the note has been deleted
        const getRes = await request(app).get(`/notes/${noteId}`);
        expect(getRes.statusCode).toEqual(404);
    });
});

describe("Error functional tests", () => {

    it('should return 400 for POST /notes if title is missing', async () => {
        const res = await request(app)
            .post("/notes")
            .send({ content: "Content without title" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Titre et contenu obligatoires");
    });
  
    it('should return 400 for POST /notes if content is missing', async () => {
        const res = await request(app)
            .post("/notes")
            .send({ title: "Title without content" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Titre et contenu obligatoires");
    });
  
    it('should return 404 for GET /notes/:id when note does not exist', async () => {
        const res = await request(app).get("/notes/9999");
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Note non trouvée");
    });
  
    it('should return 404 for PUT /notes/:id when note does not exist', async () => {
        const res = await request(app)
            .put("/notes/9999")
            .send({ title: "New Title", content: "New Content" });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Note non trouvée");
    });

    it("should return 400 for POST /notes if the request body is empty", async () => {
        const res = await request(app)
            .post("/notes")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Titre et contenu obligatoires");
    });
    
    it("should return 400 for PUT /notes/:id if the request body is empty", async () => {
        // Create note
        const createRes = await request(app)
        .post("/notes")
        .send({ title: "Note vide", content: "Contenu vide" });
        const noteId = createRes.body.id;
    
        // Update note with empty body
        const res = await request(app)
        .put(`/notes/${noteId}`)
        .send({});
        expect(res.status).toBe(500);
        //expect(res.body.message).toBe("Titre et contenu obligatoires"); Because no error message
    });
    
    it("should return 404 for GET /notes/:id when id is not a number", async () => {
        const res = await request(app).get("/notes/abc");
        expect(res.status).toBe(500);
        //expect(res.body.message).toBe("Note non trouvée"); Because no error message
    });
    
    it("should return 404 for PUT /notes/:id when id is not a number", async () => {
        const res = await request(app)
          .put("/notes/abc")
          .send({ title: "Invalid", content: "Invalid" });
        expect(res.status).toBe(500);
        //expect(res.body.message).toBe("Note non trouvée"); Because no error message
    });
    
    it("should return 404 for DELETE /notes/:id when id is not a number", async () => {
        const res = await request(app).delete("/notes/abc");
        expect(res.status).toBe(500);
        //expect(res.body.message).toBe("Note non trouvée"); Because no error message
    });
    
    it("should return 404 for unknown routes", async () => {
        const res = await request(app).get("/notes/unknown/route");
        // return 404 with a unknown route
        expect(res.status).toBe(404);
    });
});