'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import markMessageAsRead from '@/app/actions/markMessageAsRead';
import deleteMessage from '@/app/actions/deleteMessage';
import { useGlobalContext } from '@/context/GlobalContext';

const MessageCard = ({ message }) => {
  const [isRead, setIsRead] = useState(message.read);
  const [isDeleted, setIsDeleted] = useState(false);

  const { setUnreadCount } = useGlobalContext();

  const handleReadClick = async () => {
    const read = await markMessageAsRead(message._id);
    setIsRead(read);
    setUnreadCount((prevCount) => (read ? prevCount - 1 : prevCount + 1));
    toast.success(`Marcado como ${read ? 'leído' : 'nuevo'}`);
  };

  const handleDeleteClick = async () => {
    await deleteMessage(message._id);
    setIsDeleted(true);
    setUnreadCount((prevCount) => (isRead ? prevCount : prevCount - 1));
    toast.success('Mensaje eliminado');
  };

  if (isDeleted) {
    return <p>Mensaje eliminado</p>;
  }

  return (
    <div className='relative bg-white p-4 rounded-md shadow-md border border-gray-200'>
      {!isRead && (
        <div className='absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md'>
          Nuevo
        </div>
      )}
      <h2 className='text-xl mb-4'>
        <span className='font-bold'>Consulta por Propiedad:</span>{' '}
        {message.property.name}
      </h2>
      <p className='text-gray-700'>{message.body}</p>

      <ul className='mt-4'>
        <li>
          <strong>Correo de Respuesta:</strong>{' '}
          <a href={`mailto:${message.email}`} className='text-[#d4a574]'>
            {message.email}
          </a>
        </li>
        <li>
          <strong>Teléfono:</strong>{' '}
          <a href={`tel:${message.phone}`} className='text-[#d4a574]'>
            {message.phone}
          </a>
        </li>
        <li>
          <strong>Recibido:</strong>{' '}
          {new Date(message.createdAt).toLocaleString()}
        </li>
      </ul>
      <button
        onClick={handleReadClick}
        className={`mt-4 mr-3 ${
          isRead ? 'bg-gray-300' : 'bg-[#d4a574] text-white'
        } py-1 px-3 rounded-md`}
      >
        {isRead ? 'Marcar como Nuevo' : 'Marcar como Leído'}
      </button>
      <button
        onClick={handleDeleteClick}
        className='mt-4 bg-red-500 text-white py-1 px-3 rounded-md'
      >
        Eliminar
      </button>
    </div>
  );
};

export default MessageCard;
