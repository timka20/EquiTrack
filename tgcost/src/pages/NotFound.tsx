import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {}
          <div className="relative mb-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-40 h-40 mx-auto relative"
            >
              {}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-24 bg-card border-2 border-border rounded-lg shadow-lg flex items-center justify-center relative">
                  <span className="text-4xl font-bold text-muted-foreground">404</span>
                  {}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2 h-8 bg-muted rounded-full"></div>
                </div>
              </div>
              {}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
            </motion.div>
          </div>

          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Похоже, эта площадка пока не размещена на нашей платформе.
              Возможно, она была перемещена или удалена.
            </p>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Button asChild className="w-full h-12">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Вернуться на главную
              </Link>
            </Button>

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 h-10">
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Найти площадку
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-10" onClick={() => window.history.back()}>
                <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Link>
              </Button>
            </div>
          </motion.div>

          {}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-xs text-muted-foreground"
          >
            Если вы уверены, что здесь что-то должно быть —
            <a href="mailto:support@tgcost.ru" className="text-primary hover:underline ml-1">
              свяжитесь с нами
            </a>
          </motion.p>
        </motion.div>
      </div>

      {}
      <div className="px-4 py-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 TGCost — Платформа офлайн рекламы
        </p>
      </div>
    </div>
  );
};

export default NotFound;
