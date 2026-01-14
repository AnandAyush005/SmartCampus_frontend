import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/dashboard/NavBar.jsx';
import { Search as SearchIcon, FileText, AlertCircle, Package } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({
    notices: [],
    issues: [],
    lostFound: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      setUser(res.data.user || res.data.data);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [noticesRes, issuesRes, lostFoundRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/notices?search=${encodeURIComponent(searchQuery)}`, {
          withCredentials: true
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${import.meta.env.VITE_API_URL}/issues?search=${encodeURIComponent(searchQuery)}`, {
          withCredentials: true
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${import.meta.env.VITE_API_URL?.replace('/v1', '') || import.meta.env.VITE_API_URL}/lost-found?search=${encodeURIComponent(searchQuery)}`, {
          withCredentials: true
        }).catch(() => ({ data: { data: [] } }))
      ]);

      setResults({
        notices: noticesRes.data?.data || [],
        issues: issuesRes.data?.data || [],
        lostFound: lostFoundRes.data?.data || []
      });
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.notices.length + results.issues.length + results.lostFound.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-4">
            Search Results
          </h1>
          <p className="text-gray-600">
            Found {totalResults} results for "<span className="font-semibold">{query}</span>"
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Notices */}
            {results.notices.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold">Notices ({results.notices.length})</h2>
                </div>
                <div className="grid gap-4">
                  {results.notices.map((notice) => (
                    <div
                      key={notice._id}
                      onClick={() => navigate('/notices')}
                      className="bg-white rounded-xl shadow-lg p-6 border-2 border-black hover:shadow-xl cursor-pointer transition-all"
                    >
                      <h3 className="text-xl font-bold mb-2">{notice.title}</h3>
                      <p className="text-gray-700 line-clamp-2">{notice.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {results.issues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold">Issues ({results.issues.length})</h2>
                </div>
                <div className="grid gap-4">
                  {results.issues.map((issue) => (
                    <div
                      key={issue._id}
                      onClick={() => navigate('/issues')}
                      className="bg-white rounded-xl shadow-lg p-6 border-2 border-black hover:shadow-xl cursor-pointer transition-all"
                    >
                      <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
                      <p className="text-gray-700 line-clamp-2">{issue.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {issue.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lost & Found */}
            {results.lostFound.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold">Lost & Found ({results.lostFound.length})</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.lostFound.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => navigate('/lost-found')}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-black hover:shadow-xl cursor-pointer transition-all"
                    >
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt={item.title} className="w-full h-40 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-700 text-sm line-clamp-2">{item.description}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-20">
                <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-2xl text-gray-500 mb-2">No results found</p>
                <p className="text-gray-400">Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
