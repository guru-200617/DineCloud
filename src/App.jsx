import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate
} from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, CreditCard,
  Settings, LogOut, Menu, X, Plus, Search, Bell, TrendingUp, Clock3,
  CheckCircle2, CircleDollarSign, Store, ChevronRight, Trash2, Edit3,
  ShieldCheck, LockKeyhole, Crown, Eye, EyeOff, ArrowRight, Sparkles, Moon, Sun,
  ChefHat, BarChart3, UserRound, Building2, Receipt, PackageCheck
} from "lucide-react";

const SESSION_KEY = "dinecloud_session_v2";
const THEME_KEY = "dinecloud_theme";
const RESTAURANTS_KEY = "dinecloud_frontend_restaurants_v1";

const demoRestaurant = {
  id: "rest_demo_001",
  ownerId: "owner_demo_001",
  name: "Spice Garden",
  ownerName: "Demo Owner",
  email: "demo@dinecloud.com",
  phone: "+91 98765 43210",
  password: "demo123",
  plan: "Pro",
  status: "Active",
  menu: [
    { id: "m1", name: "Paneer Tikka", category: "Starters", price: 220, available: true },
    { id: "m2", name: "Chicken Biryani", category: "Main Course", price: 280, available: true },
    { id: "m3", name: "Masala Dosa", category: "South Indian", price: 90, available: true },
    { id: "m4", name: "Fresh Lime Soda", category: "Drinks", price: 70, available: true }
  ],
  orders: [
    { id: "#DC1042", customer: "Arun Kumar", items: 2, amount: 520, status: "New", time: "10:42 AM" },
    { id: "#DC1041", customer: "Priya S", items: 3, amount: 760, status: "Preparing", time: "10:25 AM" },
    { id: "#DC1040", customer: "Rahul M", items: 1, amount: 280, status: "Completed", time: "09:58 AM" }
  ],
  customers: [
    { id: "c1", name: "Arun Kumar", phone: "+91 98765 11111", orders: 8, spent: 4820 },
    { id: "c2", name: "Priya S", phone: "+91 98765 22222", orders: 6, spent: 3610 },
    { id: "c3", name: "Rahul M", phone: "+91 98765 33333", orders: 4, spent: 2280 }
  ]
};

function readRestaurants() {
  try {
    const saved = JSON.parse(localStorage.getItem(RESTAURANTS_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  const seeded = [demoRestaurant];
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeRestaurants(restaurants) {
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [session, setSessionState] = useState(getSession);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(Boolean(session));

  useEffect(() => {
    const restaurants = readRestaurants();
    if (!session) {
      setCurrentRestaurant(null);
      setLoading(false);
      return;
    }
    const restaurant = restaurants.find(item => item.id === session.restaurantId);
    if (!restaurant) {
      setSession(null);
      setSessionState(null);
      setCurrentRestaurant(null);
    } else {
      setCurrentRestaurant(restaurant);
    }
    setLoading(false);
  }, [session]);

  const login = (email, password) => {
    const restaurant = readRestaurants().find(
      item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
    );
    if (!restaurant) return { ok: false, message: "Invalid email or password." };
    const nextSession = { ownerId: restaurant.ownerId, restaurantId: restaurant.id };
    setSession(nextSession);
    setSessionState(nextSession);
    setCurrentRestaurant(restaurant);
    return { ok: true };
  };

  const signup = ({ restaurantName, ownerName, email, phone, password, plan }) => {
    const restaurants = readRestaurants();
    if (restaurants.some(item => item.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, message: "An account with this email already exists." };
    }
    const restaurant = {
      ...demoRestaurant,
      id: "rest_" + Date.now(),
      ownerId: "owner_" + Date.now(),
      name: restaurantName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      plan,
      menu: [],
      orders: [],
      customers: []
    };
    writeRestaurants([...restaurants, restaurant]);
    const nextSession = { ownerId: restaurant.ownerId, restaurantId: restaurant.id };
    setSession(nextSession);
    setSessionState(nextSession);
    setCurrentRestaurant(restaurant);
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    setSessionState(null);
    setCurrentRestaurant(null);
  };

  const updateRestaurant = (changes) => {
    if (!currentRestaurant) return;
    const updated = { ...currentRestaurant, ...changes };
    const restaurants = readRestaurants().map(item => item.id === updated.id ? updated : item);
    writeRestaurants(restaurants);
    setCurrentRestaurant(updated);
  };

  const updateMenu = (menu) => updateRestaurant({ menu });
  const updateOrders = (orders) => updateRestaurant({ orders });

  if (loading) return <div className="app-loading"><div className="loading-card"><ChefHat size={28}/><b>Loading your restaurant...</b><span>Opening your local DineCloud workspace</span></div></div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage session={session} />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <Signup onSignup={signup} />} />
      <Route path="/dashboard/*" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <DashboardHome restaurant={currentRestaurant} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="/menu" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <MenuPage restaurant={currentRestaurant} onUpdate={updateMenu} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="/orders" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <OrdersPage restaurant={currentRestaurant} onUpdate={updateOrders} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="/customers" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <CustomersPage restaurant={currentRestaurant} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="/subscription" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <SubscriptionPage restaurant={currentRestaurant} onUpdate={updateRestaurant} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="/settings" element={
        <Protected restaurant={currentRestaurant}>
          <DashboardLayout restaurant={currentRestaurant} onLogout={logout}>
            <SettingsPage restaurant={currentRestaurant} onUpdate={updateRestaurant} />
          </DashboardLayout>
        </Protected>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function Protected({ restaurant, children }) {
  return restaurant ? children : <Navigate to="/login" />;
}

function LandingPage({ session }) {
  return (
    <div className="site">
      <header className="landing-nav container">
        <Link className="brand" to="/"><span className="brand-icon"><ChefHat size={20}/></span>DineCloud</Link>
        <div className="nav-actions">
          {session ? <Link className="btn btn-primary" to="/dashboard">Open Dashboard</Link> :
          <>
            <Link className="btn btn-ghost" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/signup">Start Free</Link>
          </>}
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="pill"><Sparkles size={15}/> Restaurant management made simple</div>
            <h1>One platform.<br/><span>Every restaurant.</span></h1>
            <p className="hero-text">Give every restaurant owner their own secure workspace to manage menus, orders, customers and subscriptions — all from one powerful SaaS platform.</p>
            <div className="hero-buttons">
              <Link className="btn btn-primary btn-large" to="/signup">Create Restaurant Account <ArrowRight size={18}/></Link>
              <Link className="btn btn-secondary btn-large" to="/login">Owner Login</Link>
            </div>
            <div className="trust-row"><ShieldCheck size={17}/> Separate owner accounts & isolated restaurant data</div>
          </div>
          <div className="hero-visual">
            <div className="mock-window">
              <div className="mock-top"><span/><span/><span/><b>Restaurant Dashboard</b></div>
              <div className="mock-body">
                <div className="mock-side"><div className="mock-logo">DC</div><i/><i/><i/><i/></div>
                <div className="mock-content">
                  <div className="mock-title"><span>Good morning 👋</span><small>Sunday, Sep 27</small></div>
                  <div className="mock-cards">
                    <MiniStat title="Today's Sales" value="₹24,850" icon={<CircleDollarSign/>}/>
                    <MiniStat title="Orders" value="84" icon={<ShoppingBag/>}/>
                    <MiniStat title="Customers" value="1,240" icon={<Users/>}/>
                  </div>
                  <div className="mock-chart"><div className="chart-label">Weekly Revenue</div><div className="bars">{[38,55,48,72,62,88,76].map((h,i)=><span key={i} style={{height:h+"%"}}/>)}</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features container">
          <div className="section-heading"><div className="eyebrow">PLATFORM FEATURES</div><h2>Everything an owner needs</h2><p>Designed so you can onboard many restaurant businesses without mixing their data.</p></div>
          <div className="feature-grid">
            <Feature icon={<Store/>} title="Multi-tenant restaurants" text="Each owner gets an independent restaurant workspace and account."/>
            <Feature icon={<UtensilsCrossed/>} title="Menu management" text="Add, edit, remove and control availability of menu items."/>
            <Feature icon={<ShoppingBag/>} title="Order management" text="Track new, preparing and completed orders from one screen."/>
            <Feature icon={<CreditCard/>} title="Subscription access" text="Control features and plans for every restaurant owner."/>
            <Feature icon={<Users/>} title="Customer records" text="Keep customer activity and spending organized for each restaurant."/>
            <Feature icon={<BarChart3/>} title="Business dashboard" text="See sales, orders and operational metrics at a glance."/>
          </div>
        </section>

        <section className="pricing container">
          <div className="section-heading"><div className="eyebrow">SIMPLE PRICING</div><h2>Choose a plan</h2><p>Start small and upgrade when the restaurant grows.</p></div>
          <div className="price-grid">
            <PriceCard name="Starter" price="499" text="For small restaurants" items={["Menu management","Order tracking","Customer records"]}/>
            <PriceCard name="Pro" price="999" text="For growing restaurants" popular items={["Everything in Starter","Advanced dashboard","Priority support","Multiple staff access"]}/>
            <PriceCard name="Business" price="1,999" text="For restaurant groups" items={["Everything in Pro","Multi-branch tools","Advanced reports","Dedicated support"]}/>
          </div>
        </section>
      </main>
      <footer><div className="container footer-inner"><b>DineCloud</b><span>Restaurant SaaS platform demo</span><span>© 2026</span></div></footer>
    </div>
  );
}

function MiniStat({title,value,icon}) {
  return <div className="mini-stat"><div>{icon}</div><small>{title}</small><b>{value}</b></div>
}
function Feature({icon,title,text}) {
  return <div className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}
function PriceCard({name,price,text,items,popular}) {
  return <div className={"price-card " + (popular ? "popular" : "")}>{popular && <div className="popular-tag">MOST POPULAR</div>}<h3>{name}</h3><p>{text}</p><div className="price"><span>₹</span>{price}<small>/month</small></div><div className="price-items">{items.map(x=><div key={x}><CheckCircle2 size={16}/>{x}</div>)}</div><Link className="btn btn-primary full" to="/signup">Choose {name}</Link></div>
}

function Login({ onLogin }) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [error,setError]=useState("");
  const navigate=useNavigate();

  const submit=e=>{
    e.preventDefault();
    const result=onLogin(email,password);
    if(!result.ok) setError(result.message);
    else navigate("/dashboard");
  };

  return <AuthShell title="Welcome back" subtitle="Login to manage your restaurant">
    <form onSubmit={submit} className="auth-form">
      {error && <div className="alert error">{error}</div>}
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="owner@restaurant.com" required/></label>
      <label>Password<div className="password-wrap"><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
      <div className="form-row"><label className="check"><input type="checkbox"/> Remember me</label><a href="#forgot">Forgot password?</a></div>
      <button className="btn btn-primary btn-large full">Login to Dashboard</button>
      <div className="demo-box"><b>Demo account</b><span>Email: demo@dinecloud.com</span><span>Password: demo123</span></div>
    </form>
    <div className="auth-footer">New restaurant owner? <Link to="/signup">Create an account</Link></div>
  </AuthShell>
}

function Signup({ onSignup }) {
  const [form,setForm]=useState({restaurantName:"",ownerName:"",email:"",phone:"",password:"",plan:"Starter"});
  const [error,setError]=useState("");
  const navigate=useNavigate();
  const update=(k,v)=>setForm({...form,[k]:v});
  const submit=e=>{
    e.preventDefault();
    const result=onSignup(form);
    if(!result.ok) setError(result.message); else navigate("/dashboard");
  };
  return <AuthShell title="Create your restaurant" subtitle="Set up your owner account in minutes">
    <form onSubmit={submit} className="auth-form two-col">
      {error && <div className="alert error full-span">{error}</div>}
      <label>Restaurant name<input value={form.restaurantName} onChange={e=>update("restaurantName",e.target.value)} placeholder="e.g. Spice House" required/></label>
      <label>Owner name<input value={form.ownerName} onChange={e=>update("ownerName",e.target.value)} placeholder="Your full name" required/></label>
      <label>Email address<input type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="owner@example.com" required/></label>
      <label>Phone number<input value={form.phone} onChange={e=>update("phone",e.target.value)} placeholder="+91 98765 43210" required/></label>
      <label>Password<input type="password" value={form.password} onChange={e=>update("password",e.target.value)} placeholder="Minimum 6 characters" minLength="6" required/></label>
      <label>Plan<select value={form.plan} onChange={e=>update("plan",e.target.value)}><option>Starter</option><option>Pro</option><option>Business</option></select></label>
      <label className="check full-span"><input type="checkbox" required/> I agree to the platform terms and privacy policy.</label>
      <button className="btn btn-primary btn-large full full-span">Create Restaurant Account <ArrowRight size={18}/></button>
    </form>
    <div className="auth-footer">Already have an account? <Link to="/login">Login here</Link></div>
  </AuthShell>
}

function AuthShell({title,subtitle,children}) {
  return <div className="auth-page"><div className="auth-left"><Link className="brand auth-brand" to="/"><span className="brand-icon"><ChefHat size={20}/></span>DineCloud</Link><div className="auth-promo"><div className="pill"><ShieldCheck size={15}/> Secure restaurant workspace</div><h1>Run your restaurant.<br/><span>Grow your business.</span></h1><p>One simple platform for restaurant owners to manage the day-to-day operations.</p><div className="auth-points"><span><CheckCircle2/> Separate account</span><span><CheckCircle2/> Your own dashboard</span><span><CheckCircle2/> Easy subscription control</span></div></div></div><div className="auth-right"><div className="auth-card"><div className="mobile-brand"><Link className="brand" to="/"><span className="brand-icon"><ChefHat size={20}/></span>DineCloud</Link></div><h2>{title}</h2><p>{subtitle}</p>{children}</div></div></div>
}

function DashboardLayout({restaurant,onLogout,children}) {
  const [mobileOpen,setMobileOpen]=useState(false);
  const [theme,setTheme]=useState(()=>localStorage.getItem(THEME_KEY)||"light");
  const location=useLocation();

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    localStorage.setItem(THEME_KEY,theme);
  },[theme]);
  const navItems=[
    ["/dashboard","Dashboard",LayoutDashboard],
    ["/menu","Menu",UtensilsCrossed],
    ["/orders","Orders",ShoppingBag],
    ["/customers","Customers",Users],
    ["/subscription","Subscription",CreditCard],
    ["/settings","Settings",Settings]
  ];
  return <div className="app-shell">
    <aside className={"sidebar " + (mobileOpen?"open":"")}>
      <div className="sidebar-top"><Link className="brand" to="/dashboard"><span className="brand-icon"><ChefHat size={20}/></span>DineCloud</Link><button className="icon-btn close-mobile" onClick={()=>setMobileOpen(false)}><X/></button></div>
      <div className="restaurant-mini"><div className="avatar">{restaurant.name.charAt(0).toUpperCase()}</div><div><b>{restaurant.name}</b><span>{restaurant.plan} Plan</span></div></div>
      <nav>{navItems.map(([path,label,Icon])=><Link onClick={()=>setMobileOpen(false)} className={location.pathname===path?"active":""} key={path} to={path}><Icon size={19}/>{label}</Link>)}</nav>
      <div className="sidebar-bottom"><button className="logout-link" onClick={onLogout}><LogOut size={19}/>Logout</button><div className="sidebar-help"><ShieldCheck size={18}/><div><b>Protected workspace</b><span>Your restaurant data is isolated.</span></div></div></div>
    </aside>
    {mobileOpen && <div className="overlay" onClick={()=>setMobileOpen(false)}/>}
    <div className="main-shell">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button><div className="topbar-title"><b>{restaurant.name}</b><span>Owner workspace</span></div><div className="top-actions">
        <button className="icon-btn top-action-btn" title="Notifications" aria-label="Notifications"><Bell size={20}/><i/></button>
        <button className="icon-btn top-action-btn theme-toggle" title={theme==="light"?"Switch to dark mode":"Switch to light mode"} aria-label="Toggle dark mode" onClick={()=>setTheme(theme==="light"?"dark":"light")}>
          {theme==="light"?<Moon size={19}/>:<Sun size={19}/>}
        </button>
        <div className="top-avatar">{restaurant.ownerName.charAt(0)}</div>
      </div></header>
      <main className="dashboard-main">{children}</main>
    </div>
  </div>
}

function PageHeader({eyebrow,title,text,action}) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div>{action}</div>
}

function DashboardHome({restaurant}) {
  const sales=restaurant.orders.reduce((a,o)=>a+Number(o.amount||0),0);
  const activeOrders=restaurant.orders.filter(o=>o.status!=="Completed").length;
  return <><PageHeader eyebrow="OVERVIEW" title={"Good morning, " + restaurant.ownerName.split(" ")[0] + " 👋"} text="Here is what is happening with your restaurant today." action={<Link className="btn btn-primary" to="/orders"><ShoppingBag size={17}/> View Orders</Link>}/>
    <div className="stats-grid">
      <StatCard title="Today's Sales" value={money(sales || 24850)} change="+12.5%" icon={<CircleDollarSign/>}/>
      <StatCard title="Total Orders" value={restaurant.orders.length + 81} change="+8.2%" icon={<ShoppingBag/>}/>
      <StatCard title="Customers" value={(restaurant.customers.length || 3) + 1237} change="+5.4%" icon={<Users/>}/>
      <StatCard title="Menu Items" value={restaurant.menu.length} change={restaurant.menu.length ? "Active" : "Add items"} icon={<UtensilsCrossed/>}/>
    </div>
    <div className="dashboard-grid">
      <div className="panel large-panel"><div className="panel-head"><div><h3>Revenue overview</h3><span>Last 7 days</span></div><select><option>This week</option><option>Last week</option></select></div><div className="big-chart"><div className="y-labels"><span>₹30k</span><span>₹20k</span><span>₹10k</span><span>₹0</span></div><div className="chart-area"><div className="grid-lines"><i/><i/><i/><i/></div><div className="bars big-bars">{[45,62,54,79,66,92,74].map((h,i)=><div key={i}><span style={{height:h+"%"}}/><small>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</small></div>)}</div></div></div></div>
      <div className="panel"><div className="panel-head"><div><h3>Order status</h3><span>Today</span></div><Link to="/orders">View all</Link></div><div className="order-list"><OrderStatus label="New" count={restaurant.orders.filter(o=>o.status==="New").length + 9} icon={<Clock3/>}/><OrderStatus label="Preparing" count={restaurant.orders.filter(o=>o.status==="Preparing").length + 6} icon={<PackageCheck/>}/><OrderStatus label="Completed" count={restaurant.orders.filter(o=>o.status==="Completed").length + 66} icon={<CheckCircle2/>}/></div></div>
      <div className="panel"><div className="panel-head"><div><h3>Recent orders</h3><span>Latest activity</span></div><Link to="/orders">See all</Link></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{restaurant.orders.map(o=><tr key={o.id}><td><b>{o.id}</b></td><td>{o.customer}</td><td>{money(o.amount)}</td><td><StatusBadge status={o.status}/></td></tr>)}</tbody></table></div></div>
      <div className="panel quick-panel"><div className="panel-head"><div><h3>Quick actions</h3><span>Manage your restaurant</span></div></div><div className="quick-grid"><Link to="/menu"><Plus/><span>Add menu item</span></Link><Link to="/orders"><ShoppingBag/><span>Manage orders</span></Link><Link to="/customers"><Users/><span>View customers</span></Link><Link to="/settings"><Settings/><span>Restaurant settings</span></Link></div></div>
    </div>
  </>
}
function StatCard({title,value,change,icon}) { return <div className="stat-card"><div className="stat-icon">{icon}</div><div className="stat-meta"><span>{title}</span><b>{value}</b><small><TrendingUp size={13}/>{change} <em>vs last week</em></small></div></div> }
function OrderStatus({label,count,icon}) { return <div className="status-row"><div className="status-icon">{icon}</div><div><b>{label}</b><span>Orders</span></div><strong>{count}</strong><ChevronRight size={17}/></div> }
function StatusBadge({status}) { return <span className={"badge " + status.toLowerCase()}>{status}</span> }

function MenuPage({restaurant,onUpdate}) {
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("All");
  const [availability,setAvailability]=useState("All");
  const [showForm,setShowForm]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({name:"",category:"Main Course",price:"",available:true});

  const categories=["All",...Array.from(new Set(restaurant.menu.map(m=>m.category)))];
  const filtered=restaurant.menu.filter(m=>{
    const matchesSearch=(m.name+" "+m.category).toLowerCase().includes(search.toLowerCase());
    const matchesCategory=category==="All"||m.category===category;
    const matchesAvailability=availability==="All"||(availability==="Available"?m.available:!m.available);
    return matchesSearch&&matchesCategory&&matchesAvailability;
  });

  const open=(item=null)=>{
    setEdit(item);
    setForm(item?{...item,price:String(item.price)}:{name:"",category:"Main Course",price:"",available:true});
    setShowForm(true);
  };

  const save=e=>{
    e.preventDefault();
    const item={...form,id:edit?.id||"m_"+Date.now(),price:Number(form.price)};
    onUpdate(edit?restaurant.menu.map(x=>x.id===edit.id?item:x):[...restaurant.menu,item]);
    setShowForm(false);
  };

  const remove=id=>onUpdate(restaurant.menu.filter(x=>x.id!==id));

  const toggleAvailability=id=>onUpdate(
    restaurant.menu.map(x=>x.id===id?{...x,available:!x.available}:x)
  );

  const availableCount=restaurant.menu.filter(x=>x.available).length;
  const unavailableCount=restaurant.menu.length-availableCount;

  return <>
    <PageHeader
      eyebrow="MENU"
      title="Menu management"
      text="Create and manage the dishes your customers can order."
      action={<button className="btn btn-primary" onClick={()=>open()}><Plus size={17}/> Add Menu Item</button>}
    />

    <div className="menu-toolbar">
      <div className="search menu-search">
        <Search size={18}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search menu items..."/>
      </div>
      <div className="menu-filters">
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          {categories.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={availability} onChange={e=>setAvailability(e.target.value)}>
          <option>All</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
        <span className="menu-count"><UtensilsCrossed size={15}/>{filtered.length} of {restaurant.menu.length} items</span>
      </div>
    </div>

    <div className="menu-summary-grid">
      <div className="menu-summary-card">
        <div className="menu-summary-icon"><UtensilsCrossed size={19}/></div>
        <div><span>Total items</span><b>{restaurant.menu.length}</b></div>
      </div>
      <div className="menu-summary-card">
        <div className="menu-summary-icon success"><CheckCircle2 size={19}/></div>
        <div><span>Available</span><b>{availableCount}</b></div>
      </div>
      <div className="menu-summary-card">
        <div className="menu-summary-icon warning"><CircleSlash2 size={19}/></div>
        <div><span>Unavailable</span><b>{unavailableCount}</b></div>
      </div>
    </div>

    {showForm && <div className="modal-backdrop">
      <form className="modal menu-modal" onSubmit={save}>
        <div className="modal-head">
          <div>
            <span className="modal-kicker">MENU ITEM</span>
            <h2>{edit?"Edit menu item":"Add menu item"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={()=>setShowForm(false)} aria-label="Close"><X/></button>
        </div>

        <label>Item name
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Chicken Biryani"/>
        </label>

        <label>Category
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option>Starters</option><option>Main Course</option><option>South Indian</option>
            <option>North Indian</option><option>Drinks</option><option>Desserts</option>
          </select>
        </label>

        <label>Price (₹)
          <input type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required placeholder="199"/>
        </label>

        <label className="menu-availability-check">
          <input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/>
          <span><b>Available for ordering</b><small>Customers can order this item when enabled.</small></span>
        </label>

        <button className="btn btn-primary full">Save Item</button>
      </form>
    </div>}

    <div className="panel table-panel menu-panel">
      <div className="menu-panel-head">
        <div>
          <h3>Your menu items</h3>
          <p>Update prices, categories and ordering availability anytime.</p>
        </div>
        <button className="btn btn-secondary menu-add-small" onClick={()=>open()}><Plus size={16}/> Add Item</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length?filtered.map(item=><tr key={item.id}>
              <td>
                <div className="item-cell">
                  <div className="food-icon"><UtensilsCrossed size={18}/></div>
                  <div><b>{item.name}</b><small>Menu item</small></div>
                </div>
              </td>
              <td><span className="category-pill">{item.category}</span></td>
              <td><b>{money(item.price)}</b></td>
              <td>
                <button
                  className={"availability-toggle "+(item.available?"on":"off")}
                  onClick={()=>toggleAvailability(item.id)}
                  title="Toggle availability"
                  type="button"
                >
                  <span></span><b>{item.available?"Available":"Unavailable"}</b>
                </button>
              </td>
              <td>
                <div className="row-actions">
                  <button onClick={()=>open(item)} title="Edit item" aria-label={"Edit "+item.name}><Edit3 size={16}/></button>
                  <button onClick={()=>remove(item.id)} title="Delete item" aria-label={"Delete "+item.name}><Trash2 size={16}/></button>
                </div>
              </td>
            </tr>):<tr><td colSpan="5" className="empty">
              <div className="empty-menu">
                <div className="empty-menu-icon"><UtensilsCrossed size={24}/></div>
                <b>No menu items found</b>
                <span>{restaurant.menu.length?"Try changing your search or filters.":"Add your first dish to start building your menu."}</span>
                {!restaurant.menu.length&&<button className="btn btn-primary" onClick={()=>open()} type="button"><Plus size={16}/> Add First Item</button>}
              </div>
            </td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </>
}

function OrdersPage({restaurant,onUpdate}) {
  const [filter,setFilter]=useState("All");
  const orders=restaurant.orders.filter(o=>filter==="All"||o.status===filter);
  const changeStatus=(id,status)=>onUpdate(restaurant.orders.map(o=>o.id===id?{...o,status}:o));
  return <><PageHeader eyebrow="ORDERS" title="Order management" text="Monitor incoming orders and update their progress."/><div className="filter-tabs">{["All","New","Preparing","Completed"].map(x=><button className={filter===x?"active":""} key={x} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Time</th><th>Status</th><th>Update</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b></td><td>{o.customer}</td><td>{o.items}</td><td><b>{money(o.amount)}</b></td><td>{o.time}</td><td><StatusBadge status={o.status}/></td><td><select className="small-select" value={o.status} onChange={e=>changeStatus(o.id,e.target.value)}><option>New</option><option>Preparing</option><option>Completed</option></select></td></tr>)}</tbody></table></div></div></>
}

function CustomersPage({restaurant}) {
  return <><PageHeader eyebrow="CUSTOMERS" title="Customers" text="View the customers who interact with your restaurant."/><div className="stats-grid three"><StatCard title="Total Customers" value={restaurant.customers.length + 1237} change="+5.4%" icon={<Users/>}/><StatCard title="Returning Customers" value="68%" change="+3.1%" icon={<TrendingUp/>}/><StatCard title="Avg. Spend" value="₹1,840" change="+7.8%" icon={<CircleDollarSign/>}/></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Total Orders</th><th>Total Spent</th><th>Profile</th></tr></thead><tbody>{restaurant.customers.map(c=><tr key={c.id}><td><div className="item-cell"><div className="avatar small">{c.name.charAt(0)}</div><b>{c.name}</b></div></td><td>{c.phone}</td><td>{c.orders}</td><td><b>{money(c.spent)}</b></td><td><button className="text-btn">View profile <ChevronRight size={15}/></button></td></tr>)}</tbody></table></div></div></>
}

function SubscriptionPage({restaurant,onUpdate}) {
  const plans=[["Starter","499",["Menu management","Order tracking","Customer records"]],["Pro","999",["Everything in Starter","Advanced dashboard","Priority support","Staff access"]],["Business","1,999",["Everything in Pro","Multi-branch tools","Advanced reports","Dedicated support"]]];
  return <><PageHeader eyebrow="SUBSCRIPTION" title="Plan & billing" text="Manage the access plan for your restaurant workspace."/><div className="current-plan"><div className="current-icon"><Crown/></div><div><span>Current plan</span><h2>{restaurant.plan}</h2><p>Your restaurant workspace is active and ready to use.</p></div><div className="current-price"><b>{restaurant.plan==="Starter"?"₹499":restaurant.plan==="Pro"?"₹999":"₹1,999"}</b><span>/ month</span></div></div><div className="subscription-grid">{plans.map(([name,price,items])=><div className={"sub-card "+(restaurant.plan===name?"selected":"")} key={name}>{restaurant.plan===name&&<span className="current-tag">CURRENT PLAN</span>}<h3>{name}</h3><div className="sub-price">₹{price}<small>/month</small></div>{items.map(x=><div className="sub-item" key={x}><CheckCircle2 size={16}/>{x}</div>)}<button className={"btn "+(restaurant.plan===name?"btn-secondary":"btn-primary")+" full"} disabled={restaurant.plan===name} onClick={()=>onUpdate({plan:name})}>{restaurant.plan===name?"Active Plan":"Upgrade to "+name}</button></div>)}</div><div className="info-banner"><LockKeyhole size={20}/><div><b>Access control</b><span>In a production version, subscription status should be checked by your backend before allowing paid features. This demo stores the plan locally for demonstration.</span></div></div></>
}

function SettingsPage({restaurant,onUpdate}) {
  const [form,setForm]=useState({name:restaurant.name,ownerName:restaurant.ownerName,email:restaurant.email,phone:restaurant.phone});
  const [saved,setSaved]=useState(false);
  const save=e=>{e.preventDefault();onUpdate(form);setSaved(true);setTimeout(()=>setSaved(false),1800)};
  return <><PageHeader eyebrow="SETTINGS" title="Restaurant settings" text="Update your restaurant and owner information."/><div className="settings-grid"><form className="panel settings-form" onSubmit={save}><div className="panel-head"><div><h3>Restaurant profile</h3><span>Basic business information</span></div></div>{saved&&<div className="alert success">Settings saved successfully.</div>}<label>Restaurant name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Owner name<input value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})}/></label><label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone number<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><button className="btn btn-primary">Save Changes</button></form><div className="panel account-card"><div className="panel-head"><div><h3>Account</h3><span>Workspace information</span></div></div><div className="account-row"><Store/><div><span>Restaurant ID</span><b>{restaurant.id}</b></div></div><div className="account-row"><UserRound/><div><span>Owner ID</span><b>{restaurant.ownerId}</b></div></div><div className="account-row"><Crown/><div><span>Plan</span><b>{restaurant.plan}</b></div></div><div className="account-row"><ShieldCheck/><div><span>Status</span><b className="green-text">Active</b></div></div></div></div></>
}

export default App;