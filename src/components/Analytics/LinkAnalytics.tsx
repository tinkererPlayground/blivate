import { useState, useEffect } from 'react';
import { TrendingUp, Eye, Calendar, MapPin, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitHubService } from '@/services/githubService';

interface ClickAnalytics {
  linkId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  location?: string;
}

interface LinkAnalyticsProps {
  linkId: string;
  githubService: GitHubService | null;
}

export const LinkAnalytics = ({ linkId, githubService }: LinkAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<ClickAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [linkId, githubService]);

  const loadAnalytics = async () => {
    if (!githubService) return;

    setIsLoading(true);
    try {
      const data = await githubService.getLinkAnalytics(linkId);
      setAnalytics(data);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBrowserFromUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Autre';
  };

  const getDeviceFromUserAgent = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablette';
    return 'Desktop';
  };

  const totalClicks = analytics.length;
  const uniqueIPs = new Set(analytics.map(a => a.ip)).size;
  const browsers = analytics.reduce((acc, a) => {
    const browser = getBrowserFromUserAgent(a.userAgent);
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const devices = analytics.reduce((acc, a) => {
    const device = getDeviceFromUserAgent(a.userAgent);
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des clics</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs uniques</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueIPs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de rebond</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClicks > 0 ? Math.round((uniqueIPs / totalClicks) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browser & Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Navigateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(browsers).map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between">
                  <span className="text-sm">{browser}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(devices).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="text-sm">{device}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Clics récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.slice(0, 10).map((click, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{formatDate(click.timestamp)}</p>
                    <p className="text-xs text-muted-foreground">
                      {getBrowserFromUserAgent(click.userAgent)} • {getDeviceFromUserAgent(click.userAgent)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {click.ip.substring(0, 8)}...
                  </Badge>
                  {click.location && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {click.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {analytics.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucun clic enregistré pour le moment
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};