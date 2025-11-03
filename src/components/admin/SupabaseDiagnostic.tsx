import { useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface DiagnosticResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: string
}

const SupabaseDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnosticResults: DiagnosticResult[] = []

    // 1. Check if Supabase is configured
    diagnosticResults.push({
      name: 'Supabase Configuration',
      status: isSupabaseConfigured() ? 'success' : 'error',
      message: isSupabaseConfigured() 
        ? 'Environment variables are set'
        : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
      details: isSupabaseConfigured() 
        ? `URL: ${import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...`
        : 'Create a .env file with your Supabase credentials',
    })

    if (!isSupabaseConfigured()) {
      setResults(diagnosticResults)
      setIsRunning(false)
      return
    }

    // 2. Test database connection
    try {
      const { error: connectionError } = await supabase
        .from('custom_items')
        .select('count')
        .limit(1)

      if (connectionError) {
        diagnosticResults.push({
          name: 'Database Connection',
          status: 'error',
          message: 'Failed to connect to database',
          details: `Error: ${connectionError.message} (Code: ${connectionError.code})`,
        })
      } else {
        diagnosticResults.push({
          name: 'Database Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
        })
      }
    } catch (error: any) {
      diagnosticResults.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Connection failed',
        details: error?.message || 'Unknown error',
      })
    }

    // 3. Check if tables exist
    const tables = [
      'custom_items',
      'custom_quests',
      'custom_traders',
      'custom_locations',
      'custom_guides',
      'custom_builds',
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        if (error) {
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            diagnosticResults.push({
              name: `Table: ${table}`,
              status: 'error',
              message: 'Table does not exist',
              details: 'Run the SQL schema from SUPABASE_SCHEMA.md',
            })
          } else {
            diagnosticResults.push({
              name: `Table: ${table}`,
              status: 'warning',
              message: 'Table check failed',
              details: error.message,
            })
          }
        } else {
          diagnosticResults.push({
            name: `Table: ${table}`,
            status: 'success',
            message: 'Table exists',
          })
        }
      } catch (error: any) {
        diagnosticResults.push({
          name: `Table: ${table}`,
          status: 'error',
          message: 'Failed to check table',
          details: error?.message,
        })
      }
    }

    // 4. Test insert permission (RLS)
    try {
      // Try to insert a test record
      const testData = {
        item_id: `test-${Date.now()}`,
        tips: 'Diagnostic test - safe to delete',
      }

      const { data: insertData, error: insertError } = await supabase
        .from('custom_items')
        .insert(testData)
        .select()

      if (insertError) {
        if (insertError.message.includes('row-level security')) {
          diagnosticResults.push({
            name: 'Insert Permission (RLS)',
            status: 'error',
            message: 'Row Level Security is blocking inserts',
            details: 'Check RLS policies in Supabase Table Editor. Run the schema to create policies.',
          })
        } else {
          diagnosticResults.push({
            name: 'Insert Permission (RLS)',
            status: 'error',
            message: 'Cannot insert data',
            details: insertError.message,
          })
        }
      } else {
        // Clean up test record
        if (insertData && insertData[0]) {
          await supabase
            .from('custom_items')
            .delete()
            .eq('id', insertData[0].id)
        }

        diagnosticResults.push({
          name: 'Insert Permission (RLS)',
          status: 'success',
          message: 'Can create records successfully',
        })
      }
    } catch (error: any) {
      diagnosticResults.push({
        name: 'Insert Permission (RLS)',
        status: 'error',
        message: 'Permission test failed',
        details: error?.message,
      })
    }

    setResults(diagnosticResults)
    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Loader className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const hasErrors = results.some(r => r.status === 'error')
  const allSuccess = results.length > 0 && results.every(r => r.status === 'success')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-navy-600">
            Run diagnostics to check your Supabase setup and identify any issues.
          </p>

          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="primary"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {allSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      All checks passed! Your Supabase setup is working correctly.
                    </span>
                  </div>
                </div>
              )}

              {hasErrors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">
                      Issues detected. Please fix the errors below.
                    </span>
                  </div>
                  <p className="text-sm text-red-700">
                    See <code className="bg-red-100 px-2 py-1 rounded">TROUBLESHOOTING.md</code> for detailed solutions.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-navy-800">{result.name}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              result.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : result.status === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>
                        <p className="text-sm text-navy-700 mt-1">{result.message}</p>
                        {result.details && (
                          <p className="text-xs text-navy-600 mt-1 font-mono bg-white/50 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SupabaseDiagnostic

