import ldapjs, { Client, ClientOptions, SearchEntry } from 'ldapjs';

export class LdapClient {
  private readonly client: Client;
  private readonly userDN: string;
  private readonly password: string;

  constructor(options?: ClientOptions, userDN?: string, password?: string) {
    this.client = ldapjs.createClient(options);

    this.userDN = userDN;
    this.password = password;
  }

  public async searchUser(username: string, attributes?: string[]): Promise<SearchEntry> {
    return new Promise((resolve, reject) => {
      this.client.bind(this.userDN, this.password, (err, result) => {
        if (err) reject(err);

        this.client.search(process.env.LDAP_DN, {
          filter: `(&(objectClass=person)(uid=${username}))`,
          attributes: ['sn', ...attributes],
          scope: 'sub',
        }, (err, result) => {
          if (err) { reject('Error on search method while connecting to client'); }

          result.on('searchEntry', resolve);

          result.on('error', err => {
            reject('searching error: ' + err.message);
          });
        })
      })
    });
  }
}
