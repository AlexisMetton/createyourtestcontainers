const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { Pool } = require("pg");
const {
  setPool,
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require("../models/notesModel");
const { setupTestDB, teardownTestDB } = require("./setupTestDB");

describe("Tests du modèle Notes", () => {

    beforeAll(async () => {

        // Initialise database
        await setupTestDB();
    }, 30000);

    afterAll(async () => {
        // Clean connexion et stop container
        await teardownTestDB();
    });

    test("createNote and getNotes", async () => {
        const note = await createNote("Title 1", "Content 1");
        expect(note).toHaveProperty("id");

        const notes = await getNotes();
        expect(notes.length).toBeGreaterThan(0);
    });

    test("getNoteById", async () => {
        const note = await createNote("Title 2", "Content 2");
        const foundNote = await getNoteById(note.id);
        expect(foundNote.title).toEqual("Title 2");
        expect(foundNote.content).toEqual("Content 2");
    });

    test("updateNote", async () => {
        const note = await createNote("Title 3", "Content 3");
        const updatedNote = await updateNote(
            note.id,
            "Title update",
            "Content update"
        );
        expect(updatedNote.title).toEqual("Title update");
        expect(updatedNote.content).toEqual("Content update");
    });

    test("deleteNote", async () => {
        const note = await createNote("Title 4", "Content 4");
        const response = await deleteNote(note.id);
        expect(response).toEqual({ message: "Note successfully deleted" });

        const foundNote = await getNoteById(note.id);
        expect(foundNote).toBeUndefined();
    });

    test("Each note has a unique identifier", async () => {
        const note1 = await createNote("Note 1", "Content 1");
        const note2 = await createNote("Note 2", "Content 2");

        // Check different id
        expect(note1.id).not.toEqual(note2.id);

        // check getNoteById returns the expected note for each identifier
        const foundNote1 = await getNoteById(note1.id);
        const foundNote2 = await getNoteById(note2.id);
        expect(foundNote1.id).toEqual(note1.id);
        expect(foundNote2.id).toEqual(note2.id);
    });
});
