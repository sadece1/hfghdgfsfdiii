import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'

export interface CarFilters {
  brand?: string
  minPrice?: number
  maxPrice?: number
  fuelType?: string
  transmission?: string
  minYear?: number
  maxYear?: number
  isFeatured?: boolean
  isSold?: boolean
}

export const useCars = (filters?: CarFilters) => {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getGraders(filters)
        setCars(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [filters])

  const createCar = async (carData: any) => {
    try {
      const newCar = await apiService.createGrader(carData)
      setCars(prev => [newCar, ...prev])
      return newCar
    } catch (err) {
      throw err
    }
  }

  const updateCar = async (id: string, carData: any) => {
    try {
      const updatedCar = await apiService.updateGrader(id, carData)
      setCars(prev => prev.map(car => car.id === id ? updatedCar : car))
      return updatedCar
    } catch (err) {
      throw err
    }
  }

  const deleteCar = async (id: string) => {
    try {
      await apiService.deleteGrader(id)
      setCars(prev => prev.filter(car => car.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    cars,
    loading,
    error,
    createCar,
    updateCar,
    deleteCar,
    refetch: async () => {
      try {
        setLoading(true)
        const data = await apiService.getGraders(filters)
        setCars(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
  }
}

export const useCar = (id: string) => {
  const [car, setCar] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchCar = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getGraderById(id)
        setCar(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id])

  return { car, loading, error }
}

export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError(null)
        // This would need to be implemented in the backend
        setFavorites([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  const addToFavorites = async (carId: string) => {
    try {
      // This would need to be implemented in the backend
      console.log('Add to favorites called with:', { userId, carId })
    } catch (err) {
      throw err
    }
  }

  const removeFromFavorites = async (carId: string) => {
    try {
      // This would need to be implemented in the backend
      console.log('Remove from favorites called with:', { userId, carId })
    } catch (err) {
      throw err
    }
  }

  const isFavorite = async (carId: string) => {
    try {
      // This would need to be implemented in the backend
      console.log('Is favorite called with:', { userId, carId })
      return false
    } catch (err) {
      return false
    }
  }

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  }
}


