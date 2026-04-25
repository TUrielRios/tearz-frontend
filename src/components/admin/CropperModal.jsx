import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

/**
 * CropperModal component
 * @param {string} image - The image to crop (object URL)
 * @param {number} aspect - The aspect ratio (width / height)
 * @param {function} onCropComplete - Callback with the cropped blob
 * @param {function} onCancel - Callback to close the modal
 */
export default function CropperModal({ image, aspect, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = useCallback((crop) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom)
  }, [])

  const onComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="admin-cropper-overlay">
      <div className="admin-cropper-modal">
        <div className="admin-cropper-header">
          <h3 className="admin-cropper-title">Recortar Imagen</h3>
          <button className="admin-cropper-close" onClick={onCancel}>&times;</button>
        </div>
        
        <div className="admin-cropper-container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onComplete}
          />
        </div>

        <div className="admin-cropper-controls">
          <div className="admin-cropper-zoom">
            <label>Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="admin-cropper-range"
            />
          </div>
          <div className="admin-cropper-actions">
            <button className="admin-btn admin-btn--secondary" onClick={onCancel}>Cancelar</button>
            <button className="admin-btn admin-btn--primary" onClick={handleCrop}>Guardar Recorte</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Utility function to create the cropped image
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}
