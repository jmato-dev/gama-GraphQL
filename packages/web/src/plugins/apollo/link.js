import { ApolloLink, Observable, setContext, onError, createHttpLink } from '@apollo/client';

const loggerLink = new ApolloLink(
    (operation, forward) =>
        new Observable((observer) => {
            forward(operation).subscribe({
                next: (result) => {
                    console.log('Log', result);
                    observer.next(result);
                },
                error: observer.complete.bind(observer),
                complete: observer.complete.bind(observer),
            });
        })
);

const link = ApolloLink.from([
    loggerLink,
    onError((error) => {
        console.log('GraphQLError', error);
    }),
    setContext((_, { headers }) => {
        return {
            headers,
        };
    }),
    createHttpLink({
        uri: 'http://192.168.0.231:8000/graphql',
    }),
]);

export default link;
