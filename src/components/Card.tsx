interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-primary-200 p-6
        ${hover ? 'hover:border-accent-400 hover:shadow-lg transition-all' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return (
    <h3 className={`text-xl font-techno font-bold text-navy-800 ${className}`}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={`text-navy-600 ${className}`}>
      {children}
    </div>
  )
}

export default Card

