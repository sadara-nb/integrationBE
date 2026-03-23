"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CURRENT_USER } from "@/lib/mock-data";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState(CURRENT_USER.name);
  const [bio, setBio] = useState(CURRENT_USER.bio);
  const [website, setWebsite] = useState(CURRENT_USER.website ?? "");
  const [avatarPreview, setAvatarPreview] = useState(CURRENT_USER.avatar);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file)); //se toma la imagen seleccionada por el ususario 
    //se muestra una vista previa de la imagen seleccionada utilizando URL.createObjectURL, que crea una URL temporal para el archivo seleccionado, permitiendo que se muestre en la interfaz antes de subirla al servidor.
    setSaved(false); //se resetea el estado de guardado para permitir guardar los cambios después de seleccionar una nueva imagen

    // TODO: Upload the avatar with UploadThing and save the returned URL.
    // Example:
    //   const [result] = await uploadFiles("imageUploader", { files: [file] });
    //   setUploadedAvatarUrl(result.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); //evita que el formulario recargue la página al enviarlo -> manejar el proceso de guardado de manera asíncrona 
    setLoading(true); //indica que el proceso de guardado está en curso

    setSaved(false); //resetea el estado de guardado para evitar mostrar un mensaje de éxito si el usuario intenta guardar nuevamente sin hacer cambios


    // TODO: Replace the URL below with your real backend endpoint.
    // Also pass `avatarUrl` from UploadThing once you integrate file uploads.
    // Example: fetch("https://your-api.com/profile", { method: "POST", ... })
    
    let avatar = avatarPreview; //se revisa si hay una imagen guardada
    const file = fileRef.current?.files?.[0]; //se obtiene el archivo seleccionado por el usuario a través de la referencia al input de archivo

    if (file) {
      const formData = new FormData(); //creamos un objeto formadata porque los archivos se mandan como datos de formulario multipart/form-data
      // formadata es un formato para enviar archivos a través de HTTP que permite construir fácilmente el cuerpo de la solicitud.
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { //hacemos fetch a un endpoint de carga de archivos en nuestro backend, que se encargará de recibir el archivo, procesarlo y devolver una URL donde se puede acceder a la imagen cargada.
        method: "POST",
        body: formData, 
      });

    if (!uploadRes.ok) {
      setLoading(false);
      return;
    }

    const uploadData = await uploadRes.json(); //se espera la respuesta del servidor, que se asume que devuelve un JSON con la URL de la imagen cargada
    avatar = uploadData.url; //se toma la url de la imagen de subida y se guarda en avatar
  }

  const profileRes = await fetch(`/api/profile/${CURRENT_USER.username}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ //después de tener la URL de la imagen cargada (si se seleccionó una nueva), se envía una solicitud PATCH a un endpoint de perfil en el backend paara actualizar la info del perfil del usuario
      name,
      bio,
      website,
      avatar,
    }),
  });

  if (profileRes.ok) { //marcamos como guardado toda la información 
    setSaved(true);
    setLoading(false); //dejamos de mostrar el estado de carga
    router.push("/profile"); //redirigimos al perfil
    return;
  }
  
  setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-8">Edit profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarPreview}
            alt="Avatar preview"
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-blue-500 hover:text-blue-700"
          >
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={150}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-gray-500 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/150</p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || saved}
          className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-40"
        >
          {saved ? "Saved ✓" : loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

