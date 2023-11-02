export function token({ url, grant_type, client_id, client_secret, code, jwt_token }?: {
    url?: string;
    grant_type?: string;
    client_id?: string;
    client_secret?: string;
    code?: string;
    jwt_token?: string;
}): Promise<string | undefined>;
