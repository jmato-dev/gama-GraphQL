export default function SignIn() {
    return (
        <form action="/authenticate" method="POST">
            <fieldset>
                <label form="email">E-mail</label>
                <input id="email" name="email" type="email" inputmode="email" autocomplete="username" />
            </fieldset>
            <fieldset>
                <label form="password">Senha</label>
                <input id="password" name="password" type="password" autocomplete="current-password" />
            </fieldset>
            <button type="submit">Entrar</button>
        </form>
    );
};
