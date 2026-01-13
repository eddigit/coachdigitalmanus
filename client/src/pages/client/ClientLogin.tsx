import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

/**
 * Page de connexion pour l'espace client sécurisé
 * Design Tesla/Apple dark theme
 */
export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.clientAuth.login.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Connexion réussie");
        // Stocker le token dans localStorage
        localStorage.setItem("clientToken", data.token || "");
        setLocation("/client/dashboard");
      } else {
        toast.error(data.error || "Échec de la connexion");
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error("Erreur de connexion");
      console.error(error);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Logo et branding */}
      <div className="absolute top-8 left-8">
        <h1 className="text-2xl font-bold text-primary">COACH DIGITAL</h1>
        <p className="text-sm text-muted-foreground">Espace Client</p>
      </div>

      {/* Card de connexion */}
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
          <CardDescription className="text-base">
            Accédez à votre espace client sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => toast.info("Contactez votre coach pour réinitialiser votre mot de passe")}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {/* Informations de contact */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Besoin d'aide ? Contactez-nous à{" "}
              <a
                href="mailto:coachdigitalparis@gmail.com"
                className="text-primary hover:underline"
              >
                coachdigitalparis@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-sm text-muted-foreground">
          © 2025 Coach Digital Paris. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
