import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

// Import the MainContainer for NoteEase
import { MainContainer } from "../components/noteease";

import "../components/noteease/MainContainer.css";

export default component$(() => {
  return <MainContainer />;
});

export const head: DocumentHead = {
  title: "NoteEase - Take Notes Effortlessly",
  meta: [
    {
      name: "description",
      content: "A simple, beautiful, and organized notes app built with Qwik.",
    },
  ],
};
